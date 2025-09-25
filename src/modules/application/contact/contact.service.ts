import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { PrismaClient } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { subject } from '@casl/ability';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    try {
      const data: any = {
        name: createContactDto.name,
        email: createContactDto.email,
        subject: createContactDto.subject,
        message: createContactDto.message,
      };

      await this.prisma.contact.create({
        data: data,
      });

      return {
        success: true,
        message: 'Submitted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll() {
    try {
      const contacts = await this.prisma.contact.findMany({
        orderBy: {
          created_at: 'desc',
        },
      });


      return {
        success: true,
        data: contacts,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  async findOne(id: string) {
    try {
      const contact = await this.prisma.contact.findUnique({
        where: { id },
      });

      if (!contact) {
        return {
          success: false,
          message: 'Contact not found',
        };
      }

      return {
        success: true,
        data: contact,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}


