import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Query } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BlogUploadService } from './blog-upload.service';
import { BlogsService } from './blog.service';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { Blog_Category, BlogStatus } from '@prisma/client';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogUpload: BlogUploadService,
  ) {}

  // =========================
  // CREATE BLOG
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'contentImages', maxCount: 10 },
      ],
      { limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      contentImages?: Express.Multer.File[];
    },
  ) {
    let thumbnailImageUrl: string | undefined;
    let thumbnailVideoUrl: string | undefined;

    // Thumbnail upload
    if (files.thumbnail?.[0]) {
      const thumbUrl = await this.blogUpload.uploadOne(
        'blogs/thumbnail',
        files.thumbnail[0],
      );
      if (files.thumbnail[0].mimetype.startsWith('image/')) {
        thumbnailImageUrl = thumbUrl;
      } else {
        thumbnailVideoUrl = thumbUrl;
      }
    }

    // Content images upload
    const uploadedImages = await this.blogUpload.uploadMany(
      'blogs/content',
      files.contentImages || [],
    );

    const contentImagesMeta = body.contentImagesMeta
      ? JSON.parse(body.contentImagesMeta)
      : [];

    const contentImages = uploadedImages.map((url, i) => ({
      imageUrl: url,
      imageTitle: contentImagesMeta[i]?.imageTitle || '',
      imageDetail: contentImagesMeta[i]?.imageDetail || '',
      imageDescription: contentImagesMeta[i]?.imageDescription || '',
    }));

    return this.blogsService.create({
      title: body.title,
      authorName: body.authorName,
      descriptions: body.descriptions,
      tags: Array.isArray(body.tags) ? body.tags : [body.tags],
      category: body.category as Blog_Category,
      thumbnailImageUrl,
      thumbnailVideoUrl,
      contentImages,
      status: (body.status as BlogStatus) || BlogStatus.DRAFT,
    });
  }

  // =========================
  // UPDATE BLOG
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'thumbnail', maxCount: 1 },
        { name: 'contentImages', maxCount: 10 },
      ],
      { limits: { fileSize: 100 * 1024 * 1024 } },
    ),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: {
      thumbnail?: Express.Multer.File[];
      contentImages?: Express.Multer.File[];
    },
  ) {
    const patch: any = {};

    if (body.title !== undefined) patch.title = body.title;
    if (body.authorName !== undefined) patch.authorName = body.authorName;
    if (body.category !== undefined) patch.category = body.category;
    if (body.descriptions !== undefined) patch.descriptions = body.descriptions;

    if (body.tags !== undefined) {
      patch.tags = Array.isArray(body.tags) ? body.tags : [body.tags];
    }

    if (body.status !== undefined) {
      patch.status = body.status;
    }

    // Thumbnail update
    if (files.thumbnail?.[0]) {
      const url = await this.blogUpload.uploadOne(
        'blogs/thumbnail',
        files.thumbnail[0],
      );
      if (files.thumbnail[0].mimetype.startsWith('image/')) {
        patch.thumbnailImageUrl = url;
      } else {
        patch.thumbnailVideoUrl = url;
      }
    }

    // New content images
    if (files.contentImages?.length) {
      const uploaded = await this.blogUpload.uploadMany(
        'blogs/content',
        files.contentImages,
      );

      const meta = body.contentImagesMeta
        ? JSON.parse(body.contentImagesMeta)
        : [];

      patch.contentImages = uploaded.map((url, i) => ({
        imageUrl: url,
        imageTitle: meta[i]?.imageTitle || '',
        imageDetail: meta[i]?.imageDetail || '',
        imageDescription: meta[i]?.imageDescription || '',
      }));
    }

    return this.blogsService.update(id, patch);
  }

  // =========================
  // DELETE BLOG
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }

  // =========================
  // FIND ALL (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: BlogStatus,
    @Query('category') category?: Blog_Category,
  ) {
    return this.blogsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      category,
    });
  }

  // =========================
  // PUBLISHED BLOGS
  // =========================
  @Get('published')
  findPublished() {
    return this.blogsService.findPublished();
  }

  @Get('published/:id')
  findPublishedOne(@Param('id') id: string) {
    return this.blogsService.findPublishedOne(id);
  }

  // =========================
  // FIND ONE
  // =========================
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  // =========================
  // ADD CONTENT IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/content-images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async addContentImage(
    @Param('id') blogId: string,
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    if (!files.image?.[0]) {
      throw new BadRequestException('Image file is required');
    }

    const imageUrl = await this.blogUpload.uploadOne(
      'blogs/content',
      files.image[0],
    );

    return this.blogsService.addContentImage(blogId, {
      imageUrl,
      imageTitle: body.imageTitle || '',
      imageDetail: body.imageDetail || '',
      imageDescription: body.imageDescription || '',
    });
  }

  // =========================
  // UPDATE CONTENT IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/content-images/:imageId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateContentImage(
    @Param('id') blogId: string,
    @Param('imageId') imageId: string,
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    let imageUrl: string | undefined;

    if (files.image?.[0]) {
      imageUrl = await this.blogUpload.uploadOne(
        'blogs/content',
        files.image[0],
      );
    }

    return this.blogsService.updateContentImage(blogId, imageId, {
      imageUrl,
      imageTitle: body.imageTitle,
      imageDetail: body.imageDetail,
      imageDescription: body.imageDescription,
    });
  }

  // =========================
  // DELETE CONTENT IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/content-images/:imageId')
  deleteContentImage(
    @Param('id') blogId: string,
    @Param('imageId') imageId: string,
  ) {
    return this.blogsService.deleteContentImage(blogId, imageId);
  }
}
