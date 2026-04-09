import { Injectable, BadRequestException } from '@nestjs/common';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';

@Injectable()
export class UsedSaddleUploadService {
  private buildKey(prefix: string, file: Express.Multer.File) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    return `${prefix}/${Date.now()}-${safeName}`;
  }

  async uploadOne(prefix: string, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File missing');
    }

    const key = this.buildKey(prefix, file);
    await FileStorage.put(key, file.buffer);
    return FileStorage.url(key);
  }

  async uploadMany(prefix: string, files: Express.Multer.File[]) {
    const urls: string[] = [];

    for (const file of files || []) {
      urls.push(await this.uploadOne(prefix, file));
    }

    return urls;
  }

  async deleteOne(url: string) {
    if (!url) return;

    const key = url.split('/storage/')[1];
    if (key) {
      await FileStorage.delete(key);
    }
  }
}
