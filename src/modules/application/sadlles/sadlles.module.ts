import { Module } from '@nestjs/common';
import { SadllesService } from './sadlles.service';
import { SadllesController } from './sadlles.controller';

@Module({
  controllers: [SadllesController],
  providers: [SadllesService],
})
export class SadllesModule {}
