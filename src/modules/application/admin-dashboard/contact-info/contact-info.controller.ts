import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly service: ContactInfoService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getContactInfo() {
    const data = await this.service.getContactInfo();
    return {
      success: true,
      message: 'Contact info fetched successfully',
      data,
    };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put()
  async updateContactInfo(@Body() dto: UpdateContactInfoDto) {
    const data = await this.service.updateContactInfo(dto);
    return {
      success: true,
      message: 'Contact info updated successfully',
      data,
    };
  }
}
