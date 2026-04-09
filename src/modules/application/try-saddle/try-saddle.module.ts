import { Module } from '@nestjs/common';
import { TrySaddleService } from './try-saddle.service';
import { TrySaddleController } from './try-saddle.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [TrySaddleController],
  providers: [TrySaddleService, PrismaService],
})
export class TrySaddleModule {}
