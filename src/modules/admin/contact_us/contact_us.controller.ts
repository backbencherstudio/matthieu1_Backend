import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ContactUsService } from './contact_us.service';
import { CreateContactUsDto } from './dto/create-contact_us.dto';
import { UpdateContactUsDto } from './dto/update-contact_us.dto';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact-us')
export class ContactUsController {
  constructor(private readonly contactUsService: ContactUsService) {}

  @Roles(Role.USER)
  @Post()
  create(@Body() createContactUsDto: CreateContactUsDto) {
    return this.contactUsService.create(createContactUsDto);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.contactUsService.findAll();
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contactUsService.findOne(id);
  }

}
