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
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Query } from '@nestjs/common';
import { Blog_Category, BlogStatus } from '@prisma/client';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BlogUploadService } from './blog-upload.service';
import { BlogsService } from './blog.service';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

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
    try {
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

      return await this.blogsService
        .create({
          title: body.title,
          authorName: body.authorName,
          descriptions: body.descriptions,
          tags: Array.isArray(body.tags) ? body.tags : [body.tags],
          category: body.category as Blog_Category,
          thumbnailImageUrl,
          thumbnailVideoUrl,
          contentImages,
          status: (body.status as BlogStatus) || BlogStatus.DRAFT,
        })
        .then((data) => ({
          statusCode: 201,
          message: 'Blog created successfully',
          data,
        }));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to create blog',
      );
    }
  }
  // async create(
  //   @Body() body: any,
  //   @UploadedFiles()
  //   files: {
  //     thumbnail?: Express.Multer.File[];
  //     contentImages?: Express.Multer.File[];
  //   },
  // ) {
  //   try {
  //     let thumbnailImageUrl: string | undefined;
  //     let thumbnailVideoUrl: string | undefined;

  //     // Upload Thumbnail
  //     if (files?.thumbnail?.length) {
  //       const file = files.thumbnail[0];

  //       const thumbUrl = await this.blogUpload.uploadOne(
  //         'blogs/thumbnail',
  //         file,
  //       );

  //       if (file.mimetype.startsWith('image/')) {
  //         thumbnailImageUrl = thumbUrl;
  //       } else if (file.mimetype.startsWith('video/')) {
  //         thumbnailVideoUrl = thumbUrl;
  //       } else {
  //         throw new BadRequestException('Thumbnail must be image or video');
  //       }
  //     }

  //     // Upload content images
  //     const uploadedImages = await this.blogUpload.uploadMany(
  //       'blogs/content',
  //       files?.contentImages || [],
  //     );

  //     // Safe JSON parse
  //     let contentImagesMeta: any[] = [];
  //     try {
  //       contentImagesMeta = body.contentImagesMeta
  //         ? JSON.parse(body.contentImagesMeta)
  //         : [];
  //     } catch {
  //       throw new BadRequestException('Invalid contentImagesMeta JSON format');
  //     }

  //     const contentImages = uploadedImages.map((url, i) => ({
  //       imageUrl: url,
  //       imageTitle: contentImagesMeta[i]?.imageTitle || '',
  //       imageDetail: contentImagesMeta[i]?.imageDetail || '',
  //       imageDescription: contentImagesMeta[i]?.imageDescription || '',
  //     }));

  //     const tags =
  //       body.tags === undefined
  //         ? []
  //         : Array.isArray(body.tags)
  //           ? body.tags.filter(Boolean)
  //           : [body.tags];

  //     const data = await this.blogsService.create({
  //       title: body.title,
  //       authorName: body.authorName,
  //       descriptions: body.descriptions,
  //       tags,
  //       category: body.category as Blog_Category,
  //       thumbnailImageUrl,
  //       thumbnailVideoUrl,
  //       contentImages,
  //       status: (body.status as BlogStatus) || BlogStatus.DRAFT,
  //     });

  //     return {
  //       statusCode: 201,
  //       message: 'Blog created successfully',
  //       data,
  //     };
  //   } catch (err) {
  //     if (err instanceof HttpException) throw err;

  //     throw new InternalServerErrorException(
  //       err?.message || 'Failed to create blog',
  //     );
  //   }
  // }

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
    try {
      const patch: any = {};

      if (body.title !== undefined) patch.title = body.title;
      if (body.authorName !== undefined) patch.authorName = body.authorName;
      if (body.category !== undefined) patch.category = body.category;
      if (body.descriptions !== undefined)
        patch.descriptions = body.descriptions;

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

      return await this.blogsService.update(id, patch).then((data) => ({
        statusCode: 200,
        message: 'Blog updated successfully',
        data,
      }));
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to update blog',
      );
    }
  }

  // =========================
  // DELETE BLOG
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.blogsService.remove(id);
      return {
        statusCode: 200,
        message: 'Blog deleted successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to delete blog',
      );
    }
  }

  // =========================
  // FIND ALL (ADMIN)
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: BlogStatus,
    @Query('category') category?: Blog_Category,
  ) {
    try {
      const data = await this.blogsService.findAll({
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search,
        status,
        category,
      });
      return {
        statusCode: 200,
        message: 'Blogs fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch blogs',
      );
    }
  }

  // =========================
  // PUBLISHED BLOGS
  // =========================
  @Get('published')
  async findPublished() {
    try {
      const data = await this.blogsService.findPublished();
      return {
        statusCode: 200,
        message: 'Published blogs fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch published blogs',
      );
    }
  }

  @Get('published/:id')
  async findPublishedOne(@Param('id') id: string) {
    try {
      const data = await this.blogsService.findPublishedOne(id);
      return {
        statusCode: 200,
        message: 'Published blog fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch published blog',
      );
    }
  }

  // =========================
  // FIND ONE
  // =========================
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const data = await this.blogsService.findOne(id);
      return {
        statusCode: 200,
        message: 'Blog fetched successfully',
        data,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to fetch blog',
      );
    }
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
    try {
      if (!files.image?.[0]) {
        throw new BadRequestException('Image file is required');
      }

      const imageUrl = await this.blogUpload.uploadOne(
        'blogs/content',
        files.image[0],
      );

      const result = await this.blogsService.addContentImage(blogId, {
        imageUrl,
        imageTitle: body.imageTitle || '',
        imageDetail: body.imageDetail || '',
        imageDescription: body.imageDescription || '',
      });

      return {
        statusCode: 201,
        message: 'Content image added successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to add content image',
      );
    }
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
    try {
      let imageUrl: string | undefined;

      if (files.image?.[0]) {
        imageUrl = await this.blogUpload.uploadOne(
          'blogs/content',
          files.image[0],
        );
      }

      const result = await this.blogsService.updateContentImage(
        blogId,
        imageId,
        {
          imageUrl,
          imageTitle: body.imageTitle,
          imageDetail: body.imageDetail,
          imageDescription: body.imageDescription,
        },
      );

      return {
        statusCode: 200,
        message: 'Content image updated successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to update content image',
      );
    }
  }

  // =========================
  // DELETE CONTENT IMAGE
  // =========================
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/content-images/:imageId')
  async deleteContentImage(
    @Param('id') blogId: string,
    @Param('imageId') imageId: string,
  ) {
    try {
      const result = await this.blogsService.deleteContentImage(
        blogId,
        imageId,
      );
      return {
        statusCode: 200,
        message: 'Content image deleted successfully',
        data: result,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      throw new InternalServerErrorException(
        err?.message || 'Failed to delete content image',
      );
    }
  }
}
