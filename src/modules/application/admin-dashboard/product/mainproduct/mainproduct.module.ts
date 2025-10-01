import { Module } from '@nestjs/common';
import { MainproductService } from './mainproduct.service';
import { MainproductController } from './mainproduct.controller';

@Module({
  controllers: [MainproductController],
  providers: [MainproductService],
})
export class MainproductModule {}
