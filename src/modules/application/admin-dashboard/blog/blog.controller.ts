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

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogUpload: BlogUploadService,
  ) { }


  // Create a new blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'contentImages', maxCount: 10 },
    ], {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (for videos)
      },
    }),
  )
  async create(
    @Body() body: any,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; contentImages?: Express.Multer.File[] },
  ) {
    let thumbnailImageUrl: string | undefined;
    let thumbnailVideoUrl: string | undefined;

    if (files.thumbnail?.[0]) {
      const thumbUrl = await this.blogUpload.uploadOne('blogs/thumbnail', files.thumbnail[0]);
      if (files.thumbnail[0].mimetype.startsWith('image/')) {
        thumbnailImageUrl = thumbUrl;
      } else {
        thumbnailVideoUrl = thumbUrl;
      }
    }

    const contentFiles = files.contentImages || [];
    const uploadedImages = await this.blogUpload.uploadMany('blogs/content', contentFiles);

    const contentImagesMeta = body.contentImagesMeta
      ? JSON.parse(body.contentImagesMeta)
      : [];

    const contentImages = uploadedImages.map((url, i) => ({
      imageUrl: url,
      imageTitle: contentImagesMeta[i]?.imageTitle || '',
      imageDetail: contentImagesMeta[i]?.imageDetail || '',
    }));

    return this.blogsService.create({
      title: body.title,
      authorName: body.authorName,
      descriptions: Array.isArray(body.descriptions) ? body.descriptions : [body.descriptions],
      tags: Array.isArray(body.tags) ? body.tags : [body.tags],
      categoryId: body.categoryId,
      thumbnailImageUrl,
      thumbnailVideoUrl,
      contentImages,
      status: body.status || 'DRAFT', // <-- include status
    });
  }

  // Update a blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'contentImages', maxCount: 10 },
    ], {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit (for videos)
      },
    }),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; contentImages?: Express.Multer.File[] },
  ) {
    try {
      const patch: any = {};

      if (body.title !== undefined) patch.title = body.title;
      if (body.authorName !== undefined) patch.authorName = body.authorName;
      if (body.categoryId !== undefined) patch.categoryId = body.categoryId;

      if (body.tags !== undefined) {
        patch.tags = Array.isArray(body.tags) ? body.tags : [body.tags];
      }

      if (body.status !== undefined) {
        patch.status = body.status;
      }

      // ✅ Handle thumbnail
      if (files.thumbnail?.[0]) {
        const thumbUrl = await this.blogUpload.uploadOne('blogs/thumbnail', files.thumbnail[0]);
        const isImage = files.thumbnail[0].mimetype.startsWith('image/');
        const isVideo = files.thumbnail[0].mimetype.startsWith('video/');
        patch.thumbnailImageUrl = isImage ? thumbUrl : undefined;
        patch.thumbnailVideoUrl = isVideo ? thumbUrl : undefined;
      }

      // ✅ Handle new descriptions
      if (body.descriptions) {
        patch.descriptions = Array.isArray(body.descriptions)
          ? body.descriptions
          : [body.descriptions];
      }

      // ✅ Handle new content images (upload + metadata)
      const contentFiles = files.contentImages || [];
      let contentImagesMeta: any[] = [];
      try {
        contentImagesMeta = body.contentImagesMeta ? JSON.parse(body.contentImagesMeta) : [];
      } catch (error) {
        throw new BadRequestException('contentImagesMeta must be a valid JSON array');
      }

      if (contentFiles.length > 0) {
        const uploadedImages = await this.blogUpload.uploadMany('blogs/content', contentFiles);

        patch.contentImages = uploadedImages.map((url, i) => ({
          imageUrl: url,
          imageTitle: contentImagesMeta[i]?.imageTitle || '',
          imageDetail: contentImagesMeta[i]?.imageDetail || '',
        }));
      }

      return this.blogsService.update(id, patch);
    } catch (error) {
      console.error('Blog update error:', error);
      throw error;
    }
  }


  // Update a specific description
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/descriptions/:descriptionId')
  async updateDescription(
    @Param('id') blogId: string,
    @Param('descriptionId') descriptionId: string,
    @Body() body: { text: string },
  ) {
    return this.blogsService.updateDescription(blogId, descriptionId, body.text);
  }

  // Delete a blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }


  // Get all blogs info for Admin (paginated + searchable)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'PUBLISHED' | 'DRAFT',
    @Query('categoryId') categoryId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('monthYear') monthYear?: string, // e.g. 10/2025
  ) {
    return this.blogsService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      status,
      categoryId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
    });
  }

  // Get only published blogs (public view)
  @UseGuards(JwtAuthGuard)
  @Get('published')
  async findPublished() {
    return this.blogsService.findPublished();
  }

  // Get one published blog (public view)
  @Get('published/:id')
  async findPublishedOne(@Param('id') id: string) {
    return this.blogsService.findPublishedOne(id);
  }



  // Get a specific blog
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  // Add new content image to existing blog
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post(':id/content-images')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
  }))
  async addContentImage(
    @Param('id') blogId: string,
    @Body() body: { imageTitle: string; imageDetail: string },
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    console.log('=== ADD CONTENT IMAGE START ===');
    console.log('Received data:', {
      blogId,
      body,
      hasImageFile: !!files.image?.[0],
    });

    if (!files.image?.[0]) {
      throw new BadRequestException('Image file is required');
    }

    // Upload the image
    const imageUrl = await this.blogUpload.uploadOne('blogs/content', files.image[0]);
    console.log('Uploaded image URL:', imageUrl);

    // Create the content image
    const contentImage = await this.blogsService.addContentImage(blogId, {
      imageUrl,
      imageTitle: body.imageTitle?.trim() || '',
      imageDetail: body.imageDetail?.trim() || '',
    });

    console.log('Created content image:', contentImage);
    console.log('=== ADD CONTENT IMAGE END ===');

    return contentImage;
  }

  // Update a specific content image
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/content-images/:imageId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }], {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
  }))
  async updateContentImage(
    @Param('id') blogId: string,
    @Param('imageId') imageId: string,
    @Body() body: any,
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    console.log('=== UPDATE CONTENT IMAGE START ===');
    console.log('Received data:', {
      blogId,
      imageId,
      body,
      bodyKeys: Object.keys(body),
      bodyValues: Object.values(body),
      hasImageFile: !!files.image?.[0],
      fileInfo: files.image?.[0] ? {
        originalname: files.image[0].originalname,
        mimetype: files.image[0].mimetype,
        size: files.image[0].size
      } : null
    });

    let imageUrl: string | undefined;

    // Handle new image upload
    if (files.image?.[0]) {
      console.log('Uploading new image file...');
      imageUrl = await this.blogUpload.uploadOne('blogs/content', files.image[0]);
      console.log('New image URL:', imageUrl);
    }

    // Extract and clean the data - handle both string and array formats
    let imageTitle: string | undefined;
    let imageDetail: string | undefined;

    // Handle imageTitle
    if (body.imageTitle !== undefined) {
      if (Array.isArray(body.imageTitle)) {
        imageTitle = body.imageTitle[0]?.trim();
      } else {
        imageTitle = body.imageTitle?.trim();
      }
    }

    // Handle imageDetail
    if (body.imageDetail !== undefined) {
      if (Array.isArray(body.imageDetail)) {
        imageDetail = body.imageDetail[0]?.trim();
      } else {
        imageDetail = body.imageDetail?.trim();
      }
    }

    const updateData = {
      imageTitle: imageTitle || undefined,
      imageDetail: imageDetail || undefined,
      imageUrl,
    };

    console.log('Processed update data:', updateData);
    console.log('=== CALLING SERVICE ===');

    // Call service to update content image
    const result = await this.blogsService.updateContentImage(blogId, imageId, updateData);

    console.log('=== UPDATE RESULT ===');
    console.log('Updated content image:', result);
    console.log('=== UPDATE CONTENT IMAGE END ===');

    return result;
  }


  // Delete a specific content image
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id/content-images/:imageId')
  deleteContentImage(@Param('id') blogId: string, @Param('imageId') imageId: string) {
    console.log('=== DELETE CONTENT IMAGE START ===');
    console.log('Deleting content image:', { blogId, imageId });

    const result = this.blogsService.deleteContentImage(blogId, imageId);

    console.log('=== DELETE CONTENT IMAGE END ===');
    return result;
  }


}


