import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) {}

  async getContactInfo() {
    // always return the first record (singleton style)
    return this.prisma.contactInformation.findFirst();
  }

  async updateContactInfo(dto: UpdateContactInfoDto) {
    const existing = await this.prisma.contactInformation.findFirst();

    if (!existing) {
      // create if no record exists
      return this.prisma.contactInformation.create({
        data: dto,
      });
    }

    // update the single record
    return this.prisma.contactInformation.update({
      where: { id: existing.id },
      data: dto,
    });
  }
}
