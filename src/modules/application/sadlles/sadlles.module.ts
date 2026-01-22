import { Module } from '@nestjs/common';
import { SadllesService } from './sadlles.service';
import { SadllesController } from './sadlles.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { SaddleUploadService } from './saddle-upload.service';

@Module({
  controllers: [SadllesController],
  providers: [SadllesService, SaddleUploadService, PrismaService],
})
export class SadllesModule {}
