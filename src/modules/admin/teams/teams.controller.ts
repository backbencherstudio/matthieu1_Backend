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
@Roles(Role.ADMIN)
@Controller('admin/team')
export class TeamsController {
  constructor(
    private readonly teamsService: TeamsService,
    private readonly teamsUploadService: TeamsUploadService,
  ) {}

  @Post()
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
      // if (files?.image && files.image.length > 0) {
      //   const savedPath = await this.saveUploadedFile(
      //     files.image[0],
      //     destination,
      //     filename,
      //   );
      //   (createTeamDto as any).image = savedPath;
      // } else if (body?.data) {
      //   // body.data should be a base64 string or data URL
      //   const savedPath = await this.saveBase64Image(
      //     body.data,
      //     destination,
      //     filename,
      //   );
      //   (createTeamDto as any).image = savedPath;
      // }
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

  // private async saveUploadedFile(
  //   file: Express.Multer.File,
  //   destination: string,
  //   filename?: string,
  // ) {
  //   const destDir = path.isAbsolute(destination)
  //     ? destination
  //     : path.join(process.cwd(), destination);
  //   await this.ensureDir(destDir);
  //   const name = filename || file.originalname || `image-${Date.now()}`;
  //   const outPath = path.join(destDir, name);

  //   // If multer is configured with memory storage, file.buffer will be present
  //   if ((file as any).buffer) {
  //     await fs.writeFile(outPath, (file as any).buffer);
  //   } else if ((file as any).path) {
  //     // If multer saved the file to disk, move/rename it
  //     await fs.rename((file as any).path, outPath);
  //   } else {
  //     throw new Error('Uploaded file has no buffer or path');
  //   }

  //   return outPath;
  // }

  // private async saveBase64Image(
  //   data: string,
  //   destination: string,
  //   filename?: string,
  // ) {
  //   const destDir = path.isAbsolute(destination)
  //     ? destination
  //     : path.join(process.cwd(), destination);
  //   await this.ensureDir(destDir);

  //   let base64 = data;
  //   const match =
  //     typeof data === 'string' && data.match(/^data:(.+);base64,(.+)$/);
  //   if (match) base64 = match[2];

  //   const buffer = Buffer.from(base64, 'base64');
  //   const name = filename || `image-${Date.now()}.png`;
  //   const outPath = path.join(destDir, name);
  //   await fs.writeFile(outPath, buffer);
  //   return outPath;
  // }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll(page?: string, limit?: string) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.teamsService.findAll(pageNumber, limitNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.teamsService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async update(@Param('id') id: string, @Body() body: any, @UploadedFiles() files?: { image?: Express.Multer.File[] },) {
    
    const updateTeamDto: UpdateTeamDto = { ...(body || {}) } as any;
    
    let imageUrl: string | undefined;

    try {
      if (files?.image && files.image.length > 0) {
        imageUrl = await this.teamsUploadService.uploadOne(
          'teams',
          files.image[0],
        );
        (updateTeamDto as any).image = imageUrl;
      }
     } catch (err) {
      // Prefer letting the service/controller layer handle errors properly; rethrow for global filters
      throw err;
    }

    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id') id: string) {
    await this.teamsService.remove(id);
    return { success: true, message: 'Team removed successfully' };

  }
}
