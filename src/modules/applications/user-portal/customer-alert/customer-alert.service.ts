import { Injectable } from '@nestjs/common';
import { CreateCustomerAlertDto } from './dto/create-customer-alert.dto';
import { UpdateCustomerAlertDto } from './dto/update-customer-alert.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CustomerAlertService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateCustomerAlertDto) {
    return this.prisma.customerAlert.create({
      data,
    });
  }

  findAll() {
    return `This action returns all customerAlert`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customerAlert`;
  }

  update(id: number, updateCustomerAlertDto: UpdateCustomerAlertDto) {
    return `This action updates a #${id} customerAlert`;
  }

  remove(id: number) {
    return `This action removes a #${id} customerAlert`;
  }
}
