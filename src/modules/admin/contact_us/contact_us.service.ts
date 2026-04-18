import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContactUsDto } from './dto/create-contact_us.dto';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ContactUsService {
  constructor(private prisma: PrismaService) {}

  // Create a contact entry
  async create(dto: CreateContactUsDto) {
    const newMessage = await this.prisma.contact_us.create({
      data: dto,
    });

    return {
      success: true,
      message: 'Contact form submitted successfully.',
      data: newMessage,
    };
  }

  // Get all contact messages
  async findAll() {
    const messages = await this.prisma.contact_us.findMany({
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
      data: messages,
    };
  }

  // Get single message by ID
  async findOne(id: string) {
    const message = await this.prisma.contact_us.findUnique({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException('Contact message not found');
    }

    return {
      success: true,
      data: message,
    };
  }
}
