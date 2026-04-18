import { Module } from '@nestjs/common';
import { MainbaseproductService } from './mainbaseproduct.service';
import { MainbaseproductController } from './mainbaseproduct.controller';
import { UserMainbaseproductController } from './user.mainbaseproduct.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductUploadService } from './product-upload.service';
import { VariantController } from './variant.controller';

@Module({
  imports: [PrismaModule],
  controllers: [MainbaseproductController, UserMainbaseproductController, VariantController],
  providers: [MainbaseproductService, ProductUploadService],
})
export class MainbaseproductModule { }
