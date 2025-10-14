import { Module } from '@nestjs/common';
import { SavedProductService } from './saved-product.service';
import { SavedProductController } from './saved-product.controller';

@Module({
  controllers: [SavedProductController],
  providers: [SavedProductService],
})
export class SavedProductModule {}
