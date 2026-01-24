// import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateAmbassadorDto } from './dto/create-ambassador.dto';
// import { UpdateAmbassadorDto } from './dto/update-ambassador.dto';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { AmbassadorUploadService } from './ambassador-upload.service';
// import { Prisma } from '@prisma/client';

// @Injectable()
// export class AmbassadorService {
//   constructor(
//     private prisma: PrismaService,
//     private ambassadorUploadService: AmbassadorUploadService
//   ) { }

//   async findOne(id: string) {
//     const ambassador = await this.prisma.ambassador.findUnique({
//       where: { id },
//     });
//     if (!ambassador) {
//       throw new NotFoundException(`Ambassador with ID ${id} not found`);
//     }
//     return ambassador;
//   }
//   async create(createAmbassadorDto: CreateAmbassadorDto) {
//     try {
//       const data: any = {};
//       const name = createAmbassadorDto.name;
//       const social_links = createAmbassadorDto.social_links;
//       const image = createAmbassadorDto.image;
//       if (name) {
//         data['name'] = name;
//       }
//       if (social_links) {
//         data['social_links'] = social_links;
//       }
//       if (image) {
//         data['image'] = image;
//       }
//       await this.prisma.ambassador.create({
//         data: {
//           ...data,
//         },
//       });
//       return {
//         success: true,
//         message: 'Ambassador created successfully',
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message,
//       };
//     }
//   }

//   async findAll(page: number = 1, limit: number = 10, search?: string) {
//     const skip = (page - 1) * limit;

//     const where: Prisma.AmbassadorWhereInput = search
//       ? {
//         OR: [
//           {
//             name: {
//               contains: search,
//               mode: Prisma.QueryMode.insensitive,
//             },
//           },
//           {
//             social_links: {
//               contains: search,
//               mode: Prisma.QueryMode.insensitive,
//             },
//           },
//         ],
//       }
//       : {};

//     const [data, total] = await Promise.all([
//       this.prisma.ambassador.findMany({
//         where,
//         skip,
//         take: limit,
//         orderBy: {
//           created_at: 'desc',
//         },
//       }),
//       this.prisma.ambassador.count({ where }),
//     ]);

//     const totalPages = Math.ceil(total / limit);

//     return {
//       success: true,
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages,
//         hasNextPage: page < totalPages,
//         hasPreviousPage: page > 1,
//       },
//     };
//   }

//   async update(id: string, updateAmbassadorDto: UpdateAmbassadorDto) {
//     try {
//       const existingAmbassador = await this.prisma.ambassador.findUnique({
//         where: { id },
//         select: { image: true },
//       });

//       const data: any = {};

//       if (updateAmbassadorDto.name) data.name = updateAmbassadorDto.name;
//       if (updateAmbassadorDto.social_links) data.social_links = updateAmbassadorDto.social_links;

//       // If new image provided, delete old image first
//       if (updateAmbassadorDto.image) {
//         if (existingAmbassador?.image) {
//           try {
//             await this.ambassadorUploadService.deleteOne(existingAmbassador.image);
//           } catch (err) {
//             console.warn('Failed to delete old image:', err.message);
//           }
//         }
//         data.image = updateAmbassadorDto.image;
//       }

//       const updatedAmbassador = await this.prisma.ambassador.update({
//         where: { id },
//         data,
//       });

//       return {
//         success: true,
//         message: 'Ambassador updated successfully',
//         data: updatedAmbassador,
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message,
//       };
//     }
//   }

//   async remove(id: string) {
//     try {
//       const ambassador = await this.findOne(id);
//       if (ambassador?.image) {
//         await this.ambassadorUploadService.deleteOne(ambassador.image);
//       } else {
//         console.log('No files to delete for this ambassador');
//       }

//       await this.prisma.ambassador.delete({
//         where: {
//           id: id,
//         },
//       });
//       return {
//         success: true,
//         message: 'Ambassador deleted successfully',
//       };
//     } catch (error) {
//       return {
//         success: false,
//         message: error.message,
//       };
//     }
//   }
// }

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAmbassadorDto } from './dto/create-ambassador.dto';
import { UpdateAmbassadorDto } from './dto/update-ambassador.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AmbassadorUploadService } from './ambassador-upload.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AmbassadorService {
  constructor(
    private prisma: PrismaService,
    private ambassadorUploadService: AmbassadorUploadService,
  ) {}

  // ================= FIND ONE =================
  async findOne(id: string) {
    const ambassador = await this.prisma.ambassador.findUnique({
      where: { id },
    });

    if (!ambassador) {
      throw new NotFoundException(`Ambassador with ID ${id} not found`);
    }

    return ambassador;
  }

  // ================= CREATE =================
  async create(createAmbassadorDto: CreateAmbassadorDto) {
    try {
      const data: any = {};

      if (createAmbassadorDto.name) data.name = createAmbassadorDto.name;
      if (createAmbassadorDto.social_links)
        data.social_links = createAmbassadorDto.social_links;
      if (createAmbassadorDto.image) data.image = createAmbassadorDto.image;
      if (createAmbassadorDto.country)
        data.country = createAmbassadorDto.country;
      if (createAmbassadorDto.flag_image)
        data.flag_image = createAmbassadorDto.flag_image;

      await this.prisma.ambassador.create({ data });

      return {
        success: true,
        message: 'Ambassador created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ================= FIND ALL =================
  // async findAll(page = 1, limit = 10, search?: string) {
  //   const skip = (page - 1) * limit;

  //   const where: Prisma.AmbassadorWhereInput = search
  //     ? {
  //         OR: [
  //           {
  //             name: {
  //               contains: search,
  //               mode: Prisma.QueryMode.insensitive,
  //             },
  //           },
  //           {
  //             social_links: {
  //               contains: search,
  //               mode: Prisma.QueryMode.insensitive,
  //             },
  //           },
  //           {
  //             country: {
  //               contains: search,
  //               mode: Prisma.QueryMode.insensitive,
  //             },
  //           },
  //         ],
  //       }
  //     : {};

  //   const [data, total] = await Promise.all([
  //     this.prisma.ambassador.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { created_at: 'desc' },
  //     }),
  //     this.prisma.ambassador.count({ where }),
  //   ]);

  //   const totalPages = Math.ceil(total / limit);

  //   return {
  //     success: true,
  //     data,
  //     meta: {
  //       total,
  //       page,
  //       limit,
  //       totalPages,
  //       hasNextPage: page < totalPages,
  //       hasPreviousPage: page > 1,
  //     },
  //   };
  // }

  async findAll(page = 1, limit = 10, search?: string, country?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.AmbassadorWhereInput = {
      ...(country && {
        country: {
          equals: country,
          mode: Prisma.QueryMode.insensitive,
        },
      }),

      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            social_links: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            country: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.ambassador.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.ambassador.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  // ================= UPDATE =================
  async update(id: string, updateAmbassadorDto: UpdateAmbassadorDto) {
    try {
      const existingAmbassador = await this.prisma.ambassador.findUnique({
        where: { id },
        select: { image: true, flag_image: true },
      });

      if (!existingAmbassador) {
        throw new NotFoundException('Ambassador not found');
      }

      const data: any = {};

      if (updateAmbassadorDto.name) data.name = updateAmbassadorDto.name;
      if (updateAmbassadorDto.social_links)
        data.social_links = updateAmbassadorDto.social_links;
      if (updateAmbassadorDto.country)
        data.country = updateAmbassadorDto.country;

      if (updateAmbassadorDto.image) {
        if (existingAmbassador.image) {
          await this.ambassadorUploadService.deleteOne(
            existingAmbassador.image,
          );
        }
        data.image = updateAmbassadorDto.image;
      }

      if (updateAmbassadorDto.flag_image) {
        if (existingAmbassador.flag_image) {
          await this.ambassadorUploadService.deleteOne(
            existingAmbassador.flag_image,
          );
        }
        data.flag_image = updateAmbassadorDto.flag_image;
      }

      const updatedAmbassador = await this.prisma.ambassador.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: 'Ambassador updated successfully',
        data: updatedAmbassador,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // ================= DELETE =================
  async remove(id: string) {
    try {
      const ambassador = await this.findOne(id);

      if (ambassador.image) {
        await this.ambassadorUploadService.deleteOne(ambassador.image);
      }

      if (ambassador.flag_image) {
        await this.ambassadorUploadService.deleteOne(ambassador.flag_image);
      }

      await this.prisma.ambassador.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Ambassador deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
