import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateGeneralSettingsDto } from './dto/update-generalseting.dto';

// general-settings.service.ts
@Injectable()
export class GeneralSettingsService {
  constructor(private prisma: PrismaService) {}

  async updateSettings(dto: UpdateGeneralSettingsDto) {
    const existing = await this.prisma.generalSetting.findFirst();

    if (existing) {
      return this.prisma.generalSetting.update({
        where: { id: existing.id },
        data: { ...dto },
      });
    }

    return this.prisma.generalSetting.create({ data: { ...dto } });
  }

  async getSettings() {
    return this.prisma.generalSetting.findFirst();
  }

}
