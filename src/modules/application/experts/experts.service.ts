// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateExpertDto } from './dto/create-expert.dto';
// import { UpdateExpertDto } from './dto/update-expert.dto';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class ExpertsService {
//   constructor(private readonly prisma: PrismaService) {}

//   create(data: CreateExpertDto) {
//     return this.prisma.expert.create({ data });
//   }

//   async findAll(page = 1, limit = 10, search?: string) {
//     const skip = (page - 1) * limit;

//     const where = search
//       ? {
//           OR: [
//             { name: { contains: search, mode: 'insensitive' } },
//             { email: { contains: search, mode: 'insensitive' } },
//           ],
//         }
//       : {};

//     const [data, total] = await this.prisma.$transaction([
//       this.prisma.expert.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: { createdAt: 'desc' },
//       }),
//       this.prisma.expert.count({ where }),
//     ]);

//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async findOne(id: string) {
//     const expert = await this.prisma.expert.findUnique({ where: { id } });
//     if (!expert) throw new NotFoundException('Expert not found');
//     return expert;
//   }

//   async update(id: string, data: UpdateExpertDto) {
//     await this.findOne(id);
//     return this.prisma.expert.update({
//       where: { id },
//       data,
//     });
//   }

//   async remove(id: string) {
//     await this.findOne(id);
//     return this.prisma.expert.delete({ where: { id } });
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateExpertDto } from './dto/create-expert.dto';
import { UpdateExpertDto } from './dto/update-expert.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ExpertsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateExpertDto) {
    return this.prisma.expert.create({ data }); 
  }

  async findAll(page = 1, limit = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.ExpertWhereInput | undefined = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
            {
              email: {
                contains: search,
                mode: Prisma.QueryMode.insensitive,
              },
            },
          ],
        }
      : undefined;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.expert.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.expert.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const expert = await this.prisma.expert.findUnique({ where: { id } });
    if (!expert) throw new NotFoundException('Expert not found');
    return expert;
  }

  async update(id: string, data: UpdateExpertDto) {
    await this.findOne(id);
    return this.prisma.expert.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.expert.delete({ where: { id } });
  }

  async findByCountry(country: string) {
    return this.prisma.expert.findMany({
      where: {
        country: {
          equals: country,
          mode: Prisma.QueryMode.insensitive,
        },
      },
      select: {
        name: true,
        email: true,
        phone: true,
        region: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
