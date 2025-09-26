import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlogUploadService } from './blog-upload.service';
import { BlogsAdminController } from './blog.admin.controller';
import { BlogsService } from './blog.service';
import { BlogsPublicController } from './blog.user.controller';

@Module({
  controllers: [BlogsAdminController, BlogsPublicController],
  providers: [PrismaService, BlogsService, BlogUploadService],
  exports: [BlogsService],
})
export class BlogModule {}

