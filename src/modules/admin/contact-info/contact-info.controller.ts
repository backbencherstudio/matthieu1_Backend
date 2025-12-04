import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ContactInfoService } from './contact-info.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Contact Info')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact-info')
export class ContactInfoController {
  constructor(private readonly contactInfoService: ContactInfoService) { }

  @Get()
  @ApiOperation({ summary: 'Get the single contact information record' })
  findAll() {
    return this.contactInfoService.getContactInfo();
  }

  @Patch()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update or create the contact information' })
  update(@Body() updateContactInfoDto: UpdateContactInfoDto) {
    return this.contactInfoService.updateContactInfo(updateContactInfoDto);
  }
}