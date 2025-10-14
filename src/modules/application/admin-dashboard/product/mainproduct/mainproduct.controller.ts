import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, UseGuards, Req } from '@nestjs/common';
import { MainproductService } from './mainproduct.service';
import { CreateMainproductDto } from './dto/create-mainproduct.dto';
import { UpdateMainproductDto } from './dto/update-mainproduct.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { Request } from 'express';


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('mainproduct')
export class MainproductController {
  constructor(private readonly mainproductService: MainproductService) { }


  @Post('create-product')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 10 }], // multiple images
      { storage: memoryStorage() },
    ),
  )
  create(
    @Req() req: Request,
    @Body() createMainproductDto: CreateMainproductDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    const user_id = (req as any).user.userId;
    return this.mainproductService.createProduct(
      createMainproductDto,
      files.images ?? [],
      user_id
    );
  }

  @Get()
  findAll() {
    return this.mainproductService.findAll();
  }

  @Get('oneproduct/:id')
  async findOne(@Param('id') id: string) {
    try {
      const oneproduct = await this.mainproductService.findOne(id);
      return oneproduct;
    }
    catch (error) {
      console.error("Error fetching product:", error);
      throw error;
    }

  }

  @Patch('edit-product/:id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'images', maxCount: 10 }],
      { storage: memoryStorage() },
    ),
  )
  update(
    @Param('id') id: string,
    @Body() updateMainproductDto: UpdateMainproductDto,
    @UploadedFiles()
    files: {
      images?: Express.Multer.File[];
    },
  ) {
    return this.mainproductService.update(id, updateMainproductDto, files.images ?? []);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mainproductService.remove(id);
  }
}
