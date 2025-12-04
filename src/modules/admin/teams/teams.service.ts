import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamsUploadService } from './teams-upload.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeamsService {
  constructor(
    private prisma: PrismaService,
    private teamUploadService: TeamsUploadService
  ) { }

  private buildKey(prefix: string, file: Express.Multer.File) {
    const safeName = file.originalname.replace(/\s+/g, '_');
    return `${prefix}/${Date.now()}-${safeName}`;
  }

  async create(createTeamDto: CreateTeamDto) {
    try {
      const data: any = {};
      const name = createTeamDto.name;
      const designation = createTeamDto.designation;
      const image = createTeamDto.image;
      if (name) {
        data['name'] = name;
      }
      if (designation) {
        data['designation'] = designation;
      }
      if (image) {
        data['image'] = image;
      }
      await this.prisma.team.create({
        data: {
          ...data,
        },
      });
      return {
        success: true,
        message: 'Team created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }


  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;

    const where: Prisma.TeamWhereInput = search
      ? {
        OR: [
          {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
          {
            designation: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          },
        ],
      }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.team.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prisma.team.count({ where }),
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

  async findOne(id: string) {
    try {
      const team = await this.prisma.team.findUnique({
        where: { id },
      });

      return team;
    } catch (error) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }
  }

  // async update(id: string, updateTeamDto: UpdateTeamDto) {
  //   try {
  //     const data = {} as any;
  //     const name = updateTeamDto.name;
  //     const designation = updateTeamDto.designation;
  //     const image = updateTeamDto.image;
  //     if (name) {
  //       data['name'] = name;
  //     }
  //     if (designation) {
  //       data['designation'] = designation;
  //     }
  //     if (image) {
  //       data['image'] = image;
  //     }
  //     const team = await this.prisma.team.update({
  //       where: { id },
  //       data: data,
  //     });
  //     return {
  //       success: true,
  //       message: 'Team updated successfully',
  //       data: team,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  async update(id: string, updateTeamDto: UpdateTeamDto) {
    try {
      const existingTeam = await this.prisma.team.findUnique({
        where: { id },
        select: { image: true },
      });

      const data: any = {};

      if (updateTeamDto.name) data.name = updateTeamDto.name;
      if (updateTeamDto.designation) data.designation = updateTeamDto.designation;

      // If new image provided, delete old image first
      if (updateTeamDto.image) {
        if (existingTeam?.image) {
          try {
            await this.teamUploadService.deleteOne(existingTeam.image);
          } catch (err) {
            console.warn('Failed to delete old image:', err.message);
          }
        }
        data.image = updateTeamDto.image;
      }

      const updatedTeam = await this.prisma.team.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: 'Team updated successfully',
        data: updatedTeam,
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
      const team = await this.findOne(id);
      if (team?.image) {
        await this.teamUploadService.deleteOne(team.image);
      } else {
        console.log('No files to delete for this job');
      }

      await this.prisma.team.delete({
        where: {
          id: id,
        },
      });
      return {
        success: true,
        message: 'Team deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

}
