import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { SavedProductController } from './saved-product.controller';
import { SavedProductService } from './saved-product.service';

@Module({
    imports: [PrismaModule],
    controllers: [SavedProductController],
    providers: [SavedProductService],
    exports: [SavedProductService],
})
export class SavedProductModule { }
