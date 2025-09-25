import { Injectable } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { DateHelper } from '../../../common/helper/date.helper';

@Injectable()
export class ContactService {
  constructor(private prisma: PrismaService) {}

  async create(createContactDto: CreateContactDto) {
    try {
      const data: any = {
        name: createContactDto.name,
        email: createContactDto.email,
        phone_number: createContactDto.phone_number,
        message: createContactDto.message,
        updated_at: DateHelper.now(),
      };
      if (createContactDto.name) {
        data['name'] = createContactDto.name;
      }
      if (createContactDto.email) {
        data['email'] = createContactDto.email;
      }
      if (createContactDto.phone_number) {
        data['phone_number'] = createContactDto.phone_number;
      }
      if (createContactDto.message) {
        data['message'] = createContactDto.message;
      }

      await this.prisma.contact.create({
        data: {
          ...data,
          updated_at: DateHelper.now(),
        },
      });
      return {
        success: true,
        message: 'Contact created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll({
    q = null,
    status = null,
    page = 1,
    limit = 10,
  }: {
    q?: string;
    status?: number;
    page?: number;
    limit?: number;
  }) {
    try {
      const whereClause: any = {};

      if (q) {
        whereClause['OR'] = [
          { first_name: { contains: q, mode: 'insensitive' } },
          { last_name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone_number: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (status) {
        whereClause['status'] = Number(status);
      }

      // Ensure `limit` and `page` are numbers
      const numericLimit = Number(limit);
      const numericPage = Number(page);

      const contacts = await this.prisma.contact.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          message: true,
        },
        skip: (numericPage - 1) * numericLimit, // Pagination skip
        take: numericLimit, // Pagination limit
      });

      // Get total count for pagination info
      const totalCount = await this.prisma.contact.count({
        where: whereClause,
      });

      // Calculate the range of displayed entities
      const startEntity = (numericPage - 1) * numericLimit + 1;
      const endEntity = Math.min(numericPage * numericLimit, totalCount);

      return {
        success: true,
        data: contacts,
        pagination: {
          currentPage: numericPage,
          pageSize: numericLimit,
          totalCount,
          totalPages: Math.ceil(totalCount / numericLimit),
          pageEntitiesRange: `${startEntity} to ${endEntity} of ${totalCount} entities`,
        },
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
        select: {
          id: true,
          name: true,
          email: true,
          // phone_number: true,
          message: true,
        },
      });
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

  async update(id: string, updateContactDto: UpdateContactDto) {
    try {
      const data = {};
      if (updateContactDto.first_name) {
        data['first_name'] = updateContactDto.first_name;
      }
      if (updateContactDto.last_name) {
        data['last_name'] = updateContactDto.last_name;
      }
      if (updateContactDto.email) {
        data['email'] = updateContactDto.email;
      }
      if (updateContactDto.phone_number) {
        data['phone_number'] = updateContactDto.phone_number;
      }
      if (updateContactDto.message) {
        data['message'] = updateContactDto.message;
      }

      await this.prisma.contact.update({
        where: { id },
        data: {
          ...data,
          updated_at: DateHelper.now(),
        },
      });
      return {
        success: true,
        message: 'Contact updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.contact.delete({
        where: { id },
      });
      return {
        success: true,
        message: 'Contact deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
