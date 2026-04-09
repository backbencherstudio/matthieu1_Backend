import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CompetitionService {
  constructor(private prisma: PrismaService) {}

  private parseDate(dateStr: string): Date {
    // Input format: dd/mm/yyyy
    const [dd, mm, yyyy] = dateStr.split('/');
    if (!dd || !mm || !yyyy) {
      throw new BadRequestException('Invalid date format. Use dd/mm/yyyy');
    }
    const date = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date value');
    }
    return date;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }); // Example: Sep 5, 2025
  }

  async create(dto: CreateCompetitionDto) {
    const data: any = {
      name: dto.name,
      location: dto.location,
      discipline: dto.discipline,
      date: this.parseDate(dto.date),
    };

    try {
      await this.prisma.competition.create({ data });
      return {
        success: true,
        message: 'Competition created successfully',
        data: { ...data },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A competition with this name already exists',
          );
        }
        throw new BadRequestException(`Database error: ${error.message}`);
      }
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Validation error: ${error.message}`);
      }
      throw new BadRequestException('Failed to create competition');
    }
  }

  // async findAll(
  //   page = 1,
  //   limit = 10,
  //   search?: string,
  //   location?: string,
  //   discipline?: string,
  // ) {
  //   const skip = (page - 1) * limit;

  //   const where: Prisma.competitionWhereInput = search
  //     ? {
  //       OR: [
  //         { name: { contains: search, mode: 'insensitive' } },
  //         { location: { contains: search, mode: 'insensitive' } },
  //         { discipline: { contains: search, mode: 'insensitive' } }
  //       ],
  //     }
  //     : {};

  //   const [rows, total] = await Promise.all([
  //     this.prisma.competition.findMany({
  //       where,
  //       skip,
  //       take: limit,
  //       orderBy: { created_at: 'desc' },
  //     }),
  //     this.prisma.competition.count({ where }),
  //   ]);

  //   const data = rows.map((c) => ({
  //     ...c,
  //     date: this.formatDate(c.date),
  //   }));

  //   return {
  //     success: true,
  //     data,
  //     meta: { total, page, limit },
  //   };
  // }

  async findAll(
    page: number,
    limit: number,
    search?: string,
    location?: string,
    discipline?: string,
  ) {
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { discipline: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (discipline) {
      where.discipline = { contains: discipline, mode: 'insensitive' };
    }

    const total = await this.prisma.competition.count({ where });

    const data = await this.prisma.competition.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return {
      success: true,
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
    const result = await this.prisma.competition.findUnique({ where: { id } });
    if (!result) throw new NotFoundException('Competition not found');

    return { ...result, date: this.formatDate(result.date) };
  }

  async update(id: string, dto: UpdateCompetitionDto) {
    const comp = await this.prisma.competition.findUnique({
      where: { id },
    });

    if (!comp) {
      throw new NotFoundException('Competition not found');
    }

    let formattedDate: Date | undefined = undefined;

    if (dto.date) {
      const [day, month, year] = dto.date.split('/').map(Number);
      formattedDate = new Date(2000 + year, month - 1, day); // dd/mm/yy
    }

    try {
      const updated = await this.prisma.competition.update({
        where: { id },
        data: {
          name: dto.name ?? comp.name,
          location: dto.location ?? comp.location,
          discipline: dto.discipline ?? comp.discipline,
          date: formattedDate ?? comp.date,
        },
      });

        return {
        success: true,
        message: 'Competition updated successfully',
        data: {
          ...updated,
          date: updated.date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
        },
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException(
            'A competition with this name already exists',
          );
        }
      }
      throw new BadRequestException('Failed to update competition');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.competition.delete({ where: { id } });

      return {
        success: true,
        message: 'Competition deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Failed to delete competition');
    }
  }
}
