import { Module } from '@nestjs/common';
import { UsedSaddleService } from './used-saddle.service';
import { UsedSaddleController } from './used-saddle.controller';
import { UsedSaddleUploadService } from './used-saddle-upload.service';

@Module({
  controllers: [UsedSaddleController],
  providers: [UsedSaddleService, UsedSaddleUploadService],
})
export class UsedSaddleModule {}
