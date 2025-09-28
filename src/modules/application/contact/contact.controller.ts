import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';

@ApiTags('Contact')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) { }

  @ApiOperation({ summary: 'Create contact' })
  @Post()
  async create(@Body() createContactDto: CreateContactDto) {
    try {
      const contact = await this.contactService.create(createContactDto);
      return contact;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Get all contacts' })
  @Get()
  async findAll() {
    try {
      const contacts = await this.contactService.findAll();
      return contacts;

    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Get contact by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const contact = await this.contactService.findOne(id);
      console.log("Retrieved contact:", contact);
      return contact;
    } catch (error) {
      return {
        success: false,

        message: error.message,
      };
    }

  }
}