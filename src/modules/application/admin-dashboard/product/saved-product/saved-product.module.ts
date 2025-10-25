import { Module } from '@nestjs/common';
import { SavedBaseProductService } from './saved-product.service';
import { SavedBaseProductController } from './saved-product.controller';

@Module({
  controllers: [SavedBaseProductController],
  providers: [SavedBaseProductService],
})
export class SavedBaseProductModule {}
