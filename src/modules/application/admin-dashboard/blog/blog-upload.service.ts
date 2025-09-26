import { Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';


type UploadedFileMeta = {
  file_name: string;
  file_key: string;
  file_url: string;
  file_size: number;
  mime_type: string;
};

@Injectable()
export class BlogUploadService {
  private buildKey(prefix: string, userId: string, file: Express.Multer.File) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    return `${prefix}/${userId}-${Date.now()}-${safeName}`;
  }

  async uploadThumbnail(userId: string, file: Express.Multer.File): Promise<UploadedFileMeta> {
    if (!file) throw new BadRequestException('thumbnail file is required');

    const isImage = file.mimetype.startsWith('image/');
    const isVideo = file.mimetype.startsWith('video/');
    if (!isImage && !isVideo) {
      throw new BadRequestException('thumbnail must be an image or video');
    }

    const key = this.buildKey('blogs/thumbnail', userId, file);
    await FileStorage.put(key, file.buffer);

    return {
      file_name: file.originalname,
      file_key: key,
      file_url: FileStorage.url(key),
      file_size: file.size,
      mime_type: file.mimetype,
    };
  }

  async uploadContentImages(userId: string, files: Express.Multer.File[]): Promise<UploadedFileMeta[]> {
    const uploaded: UploadedFileMeta[] = [];
    for (const f of files || []) {
      if (!f.mimetype.startsWith('image/')) {
        throw new BadRequestException('contentImages must be images only');
      }
      const key = this.buildKey('blogs/content-images', userId, f);
      await FileStorage.put(key, f.buffer);
      uploaded.push({
        file_name: f.originalname,
        file_key: key,
        file_url: FileStorage.url(key),
        file_size: f.size,
        mime_type: f.mimetype,
      });
    }
    return uploaded;
  }
}
