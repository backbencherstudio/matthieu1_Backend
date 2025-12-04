import { Module } from '@nestjs/common';
import { AmbassadorService } from './ambassador.service';
import { AmbassadorController } from './ambassador.controller';
import { AmbassadorUploadService } from './ambassador-upload.service';

@Module({
  controllers: [AmbassadorController],
  providers: [AmbassadorService, AmbassadorUploadService],
})
export class AmbassadorModule { }
