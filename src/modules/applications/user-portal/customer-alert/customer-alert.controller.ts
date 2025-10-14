import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CustomerAlertService } from './customer-alert.service';
import { CreateCustomerAlertDto } from './dto/create-customer-alert.dto';
import { UpdateCustomerAlertDto } from './dto/update-customer-alert.dto';

@Controller('customer-alert')
export class CustomerAlertController {
  constructor(private readonly customerAlertService: CustomerAlertService) {}


  @Post()
  create(@Body() createCustomerAlertDto: CreateCustomerAlertDto) {
    return this.customerAlertService.create(createCustomerAlertDto);
  }

  @Get()
  findAll() {
    return this.customerAlertService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerAlertService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerAlertDto: UpdateCustomerAlertDto) {
    return this.customerAlertService.update(+id, updateCustomerAlertDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerAlertService.remove(+id);
  }
}
