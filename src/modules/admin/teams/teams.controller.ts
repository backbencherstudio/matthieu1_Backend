import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TeamsUploadService } from './teams-upload.service';

@ApiBearerAuth()
@ApiTags('Team')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('team')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsUploadService: TeamsUploadService,
  ) { }

  @Post()
  @Roles(Role.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async create(
    @Body() body: any,
    @UploadedFiles() files?: { image?: Express.Multer.File[] },
  ) {
    // normalize DTO from body
    const createTeamDto: CreateTeamDto = { ...(body || {}) } as any;

    const destination = body?.destination || 'uploads/teams';
    const filename =
      body?.name ||
      (files?.image && files.image[0]
        ? files.image[0].originalname
        : undefined);

    let imageUrl: string | undefined;

    try {
      if (files?.image && files.image.length > 0) {
        imageUrl = await this.teamsUploadService.uploadOne(
          'teams',
          files.image[0],
        );
        (createTeamDto as any).image = imageUrl;
      }
    } catch (err) {
      // Prefer letting the service/controller layer handle errors properly; rethrow for global filters
      throw err;
    }

    console.log('createTeamDto:', createTeamDto);
    return this.teamsService.create(createTeamDto);
  }

  private async ensureDir(dir: string) {
    await fs.mkdir(dir, { recursive: true });
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.teamsService.findAll(pageNumber, limitNumber, search);
  }


  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  // @Patch(':id')
  // @Roles(Role.ADMIN)
  // @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  // async update(@Param('id') id: string, @Body() body: any, @UploadedFiles() files?: { image?: Express.Multer.File[] },) {

  //   const updateTeamDto: UpdateTeamDto = { ...(body || {}) } as any;

  //   let imageUrl: string | undefined;

  //   try {
  //     if (files?.image && files.image.length > 0) {
  //       imageUrl = await this.teamsUploadService.uploadOne(
  //         'teams',
  //         files.image[0],
  //       );
  //       (updateTeamDto as any).image = imageUrl;
  //     }
  //   } catch (err) {
  //     // Prefer letting the service/controller layer handle errors properly; rethrow for global filters
  //     throw err;
  //   }

  //   return this.teamsService.update(id, updateTeamDto);
  // }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() files?: { image?: Express.Multer.File[] },
  ) {
    const updateTeamDto: UpdateTeamDto = { ...(body || {}) } as any;

    try {
      if (files?.image && files.image.length > 0) {
        const imageUrl = await this.teamsUploadService.uploadOne(
          'teams',
          files.image[0],
        );
        updateTeamDto.image = imageUrl;
      }
    } catch (err) {
      throw err;
    }

    return this.teamsService.update(id, updateTeamDto);
  }


  @Delete(':id')
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.teamsService.remove(id);
    return { success: true, message: 'Team removed successfully' };

  }
}
