// src/contact-infos/contact-infos.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; // Import PrismaService
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Injectable()
export class ContactInfosService {
  constructor(private readonly prisma: PrismaService) {}

  // Get the contact info (only one record)
  async getContactInfo() {
    const contactInfo = await this.prisma.contact_infos.findFirst();
    if (!contactInfo) {
      throw new NotFoundException('Contact info not found');
    }
    return contactInfo;
  }

  // Update or create the contact info
  async upsertContactInfo(updateContactInfoDto: UpdateContactInfoDto) {
    // Try to find the contact info (since there's only one record, we use findFirst)
    const contactInfo = await this.prisma.contact_infos.findFirst();

    if (contactInfo) {
      // If record exists, update it
      return this.prisma.contact_infos.update({
        where: { id: contactInfo.id }, // Update the existing record using its ID
        data: updateContactInfoDto, // Apply the updated data
      });
    } else {
      // If no record exists, create a new one
      return this.prisma.contact_infos.create({
        data: updateContactInfoDto, // Insert new data
      });
    }
  }
}
