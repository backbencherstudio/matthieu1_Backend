

// import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

// @Injectable()
// export class ContactInfoService {
//   constructor(private prisma: PrismaService) {}

//   async getContactInfo() {
//     const contactInfo = await this.prisma.contact_info.findFirst();

//     // if (!contactInfo) {
//     //   throw new NotFoundException(
//     //     'Contact information not found. It may not have been created yet.',
//     //   );
//     // }

//     return contactInfo;
//   }


//   async updateContactInfo(dto: UpdateContactInfoDto) {
//     const existingInfo = await this.prisma.contact_info.findFirst();

//     if (existingInfo) {

//       const updatedInfo = await this.prisma.contact_info.update({
//         where: { id: existingInfo.id },
//         data: dto,
//       });

//       return {
//         success: true,
//         message: 'Contact information updated successfully.',
//         data: updatedInfo,
//       };
//     } else {

//       if (!dto.address) {
//         throw new BadRequestException('Address is required to create contact information.');
//       }


//       const createData = {
//         address: dto.address, 
//         fb_link: dto.fb_link,
//         instagram_link: dto.instagram_link,
//         tiktok_link: dto.tiktok_link,
//         youtube_link: dto.youtube_link,
//       };

//       const newInfo = await this.prisma.contact_info.create({
//         data: createData,
//       });

//       return {
//         success: true,
//         message: 'Contact information created successfully.',
//         data: newInfo,
//       };
//     }
//   }
// }

// src/contact-info/contact-info.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateContactInfoDto } from './dto/update-contact-info.dto';

@Injectable()
export class ContactInfoService {
  constructor(private prisma: PrismaService) { }

  /**
   * Finds the single contact information record.
   * If no record exists, it returns null instead of throwing an error.
   * This makes the API more robust for a singleton pattern.
   */
  async getContactInfo() {
    // Just find the first record. It will be the object or null.
    const contactInfo = await this.prisma.contact_info.findFirst();

    // Return whatever was found (the object or null).
    // The controller will send a 200 OK with the data.
    return contactInfo;
  }

  /**
   * Updates the contact information if a record exists.
   * If the database is empty, it creates a new one.
   * (This method is correct and does not need to be changed).
   */
  async updateContactInfo(dto: UpdateContactInfoDto) {
    const existingInfo = await this.prisma.contact_info.findFirst();

    if (existingInfo) {
      const updatedInfo = await this.prisma.contact_info.update({
        where: { id: existingInfo.id },
        data: dto,
      });

      return {
        success: true,
        message: 'Contact information updated successfully.',
        data: updatedInfo,
      };
    } else {
      if (!dto.address) {
        throw new BadRequestException('Address is required to create contact information.');
      }

      const createData = {
        address: dto.address,
        fb_link: dto.fb_link,
        instagram_link: dto.instagram_link,
        tiktok_link: dto.tiktok_link,
        youtube_link: dto.youtube_link,
      };

      const newInfo = await this.prisma.contact_info.create({
        data: createData,
      });

      return {
        success: true,
        message: 'Contact information created successfully.',
        data: newInfo,
      };
    }
  }
}