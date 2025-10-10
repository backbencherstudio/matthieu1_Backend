// src/modules/blogs/blog-upload.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';


@Injectable()
export class BlogUploadService {
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
    // 1. "http://localhost:3000/storage/blogs/123-file.pdf" -> "blogs/123-file.pdf"
    // 2. "http://localhost:3000/public/storage/blogs/123-file.pdf" -> "blogs/123-file.pdf"
    // 3. Malformed: "http://localhost:3000/public/storageblogs/123-file.pdf" -> "blogs/123-file.pdf"

    // Try to match /storage/ or /public/storage/ (correct format)
    let match = url.match(/\/(?:public\/)?storage\/(.+)$/);

    if (match) {
      return match[1];
    }

    // Try to match malformed URLs without slash: /storageblogs/
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
    if (!url) return;

    try {
      const key = this.extractKeyFromUrl(url);
      // console.log(`Attempting to delete file - URL: ${url}, Extracted Key: ${key}`);
      const deleted = await FileStorage.delete(key);
      // console.log(`File deletion result for ${key}:`, deleted);
    } catch (error) {
      console.error(`Failed to delete file: ${url}`, error);
    }
  }

  /**
   * Delete multiple files
   * @param urls Array of file URLs
   */
  async deleteMany(urls: string[]) {
    if (!urls || urls.length === 0) return;

    console.log(`Deleting ${urls.length} files:`, urls);

    for (const url of urls) {
      if (url) {
        await this.deleteOne(url);
      }
    }
  }
}
