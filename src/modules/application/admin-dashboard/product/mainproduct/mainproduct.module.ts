import { Module } from '@nestjs/common';
import { MainproductService } from './mainproduct.service';
import { MainproductController } from './mainproduct.controller';
import { UserMainproductController } from './user.mainproduct.controller';

@Module({
  controllers: [MainproductController, UserMainproductController],
  providers: [MainproductService],
})
export class MainproductModule { }
