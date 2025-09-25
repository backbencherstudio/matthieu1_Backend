import { Module } from '@nestjs/common';
import { GeneralSettingsController } from './general-setings.controller';
import { GeneralSettingsService } from './general-setings.service';


@Module({
  controllers: [GeneralSettingsController],
  providers: [GeneralSettingsService],
})
export class GeneralSettingsModule {}
