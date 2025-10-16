import { Module } from '@nestjs/common';
import { MaincategoryService } from './maincategory.service';
import { MaincategoryController } from './maincategory.controller';

@Module({
  controllers: [MaincategoryController],
  providers: [MaincategoryService],
})
export class MaincategoryModule {}
