import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ContactInfosService } from './contact-infos.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@Controller('contact-infos')
@UseGuards(JwtAuthGuard, RolesGuard)  // Apply guards at the controller level
export class ContactInfosController {
  constructor(private readonly contactInfosService: ContactInfosService) {}

  // Get the contact info
  @Get()
  async getContactInfo() {
    return this.contactInfosService.getContactInfo();
  }

  // Update or create the contact info
  @Roles(Role.ADMIN) // Restrict this to ADMIN role
  @Patch()
  async upsertContactInfo(@Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfosService.upsertContactInfo(updateContactInfoDto);
  }
}
