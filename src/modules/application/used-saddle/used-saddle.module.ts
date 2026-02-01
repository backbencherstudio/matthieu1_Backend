import { Module } from '@nestjs/common';
import { UsedSaddleService } from './used-saddle.service';
import { UsedSaddleController } from './used-saddle.controller';

@Module({
  controllers: [UsedSaddleController],
  providers: [UsedSaddleService],
})
export class UsedSaddleModule {}
