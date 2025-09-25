import { Module } from '@nestjs/common';
import { ApplepayService } from './applepay.service';
import { ApplepayController } from './applepay.controller';

@Module({
  controllers: [ApplepayController],
  providers: [ApplepayService],
})
export class ApplepayModule {}
