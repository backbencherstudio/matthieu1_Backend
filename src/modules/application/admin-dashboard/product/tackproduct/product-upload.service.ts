import { Injectable, BadRequestException } from '@nestjs/common';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';

@Injectable()
export class ProductUploadService {
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

    private extractKeyFromUrl(url: string): string {
        let match = url.match(/\/(?:public\/)?storage\/(.+)$/);
        if (match) return match[1];
        match = url.match(/\/(?:public\/)?storage(.+)$/);
        if (match) return match[1].startsWith('/') ? match[1].substring(1) : match[1];
        return url;
    }

    async deleteOne(url: string) {
        if (!url) return;
        try {
            const key = this.extractKeyFromUrl(url);
            await FileStorage.delete(key);
        } catch (e) {
            // swallow delete errors to avoid blocking business flow
        }
    }
}


