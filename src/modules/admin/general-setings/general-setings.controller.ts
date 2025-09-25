// general-settings.controller.ts
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { GeneralSettingsService } from './general-setings.service';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { UpdateGeneralSettingsDto } from './dto/update-generalseting.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GeneralSettingsController {
  constructor(private readonly generalSettingsService: GeneralSettingsService) {}

  @Post('general-settings')
  @Roles(Role.ADMIN)
  async updateSettings(@Body() dto: UpdateGeneralSettingsDto) {
    const result = await this.generalSettingsService.updateSettings(dto);
    return {
      success: true,
      message: 'Settings updated successfully',
      data: result,
    };
  }


  @Get('general-settings')
  async getSettings() {
    const result = await this.generalSettingsService.getSettings();
    return {
      success: true,
      data: result,
    };
  }
  
}
