import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ColorSizeController } from './color-size.controller';
import { ColorSizeService } from './color-size.service';

@Module({
  imports: [PrismaModule],
  controllers: [ColorSizeController],
  providers: [ColorSizeService],
})
export class ColorSizeModule { }
