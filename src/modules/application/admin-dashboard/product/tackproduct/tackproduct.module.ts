import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductUploadService } from './product-upload.service';
import { VariantController } from './variant.controller';
import { TackproductController } from './tackproduct.controller';
import { TackproductService } from './tackproduct.service';

@Module({
  imports: [PrismaModule],
  controllers: [TackproductController, VariantController],
  providers: [TackproductService, ProductUploadService],
})
export class TackproductModule {}
