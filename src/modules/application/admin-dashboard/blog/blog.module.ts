import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BlogUploadService } from './blog-upload.service';
import { BlogsController } from './blog.controller';
import { BlogsService } from './blog.service';
// import { BlogsPublicController } from './blog.user.controller';

@Module({
  imports: [PrismaModule],
  controllers: [BlogsController],
  providers: [BlogsService, BlogUploadService],
  exports: [BlogsService],
})
export class BlogModule { }

