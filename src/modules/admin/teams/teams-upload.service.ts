import { Injectable, BadRequestException } from '@nestjs/common';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';

@Injectable()
export class TeamsUploadService {
    private buildKey(prefix: string, file: Express.Multer.File) {
        const safeName = file.originalname.replace(/\s+/g, '_');
        return `${prefix}/${Date.now()}-${safeName}`;
    }

    async uploadOne(prefix: string, file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File missing');
        const key = this.buildKey(prefix, file);
        await FileStorage.put(key, file.buffer);
        return FileStorage.url(key);
    }

    async uploadMany(prefix: string, files: Express.Multer.File[]) {
        const urls: string[] = [];
        for (const f of files || []) {
            urls.push(await this.uploadOne(prefix, f));
        }
        return urls;
    }

    /**
     * Extract the file key from a URL
     * @param url Full file URL
     * @returns File key (path)
     */
    private extractKeyFromUrl(url: string): string {
        // Handle multiple formats:
        // 1. "http://localhost:3000/storage/job-portal/123-file.pdf" -> "job-portal/123-file.pdf"
        // 2. "http://localhost:3000/public/storage/job-portal/123-file.pdf" -> "job-portal/123-file.pdf"
        // 3. Malformed: "http://localhost:3000/public/storagejob-portal/123-file.pdf" -> "job-portal/123-file.pdf"

        // Try to match /storage/ or /public/storage/ (correct format)
        let match = url.match(/\/(?:public\/)?storage\/(.+)$/);

        if (match) {
            return match[1];
        }

        // Try to match malformed URLs without slash: /storagejob-portal/
        match = url.match(/\/(?:public\/)?storage(.+)$/);

        if (match) {
            // Remove leading slash if present
            return match[1].startsWith('/') ? match[1].substring(1) : match[1];
        }

        // If no match, assume it's already a key
        return url;
    }

    /**
     * Delete a single file
     * @param url File URL to delete
     */
    async deleteOne(url: string) {
        try {
            const key = this.extractKeyFromUrl(url);
            console.log(`Attempting to delete file - URL: ${url}, Extracted Key: ${key}`);
            const deleted = await FileStorage.delete(key);
            console.log(`File deletion result for ${key}:`, deleted);
        } catch (error) {
            console.error(`Failed to delete file: ${url}`, error);
        }
    }

    /**
     * Delete multiple files
     * @param urls Comma-separated string of file URLs or array of URLs
     */
    async deleteMany(urls: string | string[]) {
        if (!urls) return;

        const urlArray = typeof urls === 'string' ? urls.split(',').filter(Boolean) : urls;
        console.log(`Deleting ${urlArray.length} files:`, urlArray);

        for (const url of urlArray) {
            await this.deleteOne(url.trim());
        }
    }
}
