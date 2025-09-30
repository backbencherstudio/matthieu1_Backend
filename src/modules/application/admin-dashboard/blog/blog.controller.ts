// import {
//   BadRequestException,
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   Patch,
//   Post,
//   UploadedFiles,
//   UseGuards,
//   UseInterceptors,
// } from '@nestjs/common';
// import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
// import { RolesGuard } from 'src/common/guard/role/roles.guard';
// import { FileFieldsInterceptor } from '@nestjs/platform-express';
// import { BlogUploadService } from './blog-upload.service';
// import { BlogsService } from './blog.service';

// @Controller('blogs')
// export class BlogsController {
//   constructor(
//     private readonly blogsService: BlogsService,
//     private readonly blogUpload: BlogUploadService,
//   ) { }

//   // Create blog (admin only)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Post()
//   @UseInterceptors(
//     FileFieldsInterceptor([
//       { name: 'thumbnail', maxCount: 1 },  // optional on create
//       { name: 'contentImages', maxCount: 10 },  // optional on create
//     ]),
//   )
//   async create(
//     @Body() body: any,
//     @UploadedFiles()
//     files: { thumbnail?: Express.Multer.File[]; contentImages?: Express.Multer.File[] },
//   ) {
//     let thumbnailImageUrl: string | undefined;
//     let thumbnailVideoUrl: string | undefined;

//     if (files.thumbnail?.[0]) {
//       const thumbUrl = await this.blogUpload.uploadOne('blogs/thumbnail', files.thumbnail[0]);
//       if (files.thumbnail[0].mimetype.startsWith('image/')) {
//         thumbnailImageUrl = thumbUrl;
//       } else {
//         thumbnailVideoUrl = thumbUrl;
//       }
//     }

//     // Handle content images
//     const contentFiles = files.contentImages || [];
//     const uploadedImages = await this.blogUpload.uploadMany('blogs/content', contentFiles);

//     // Map content image metadata from the provided data (imageTitle, imageDetail)
//     const contentImagesMeta = body.contentImagesMeta
//       ? JSON.parse(body.contentImagesMeta) // Parse metadata from body
//       : [];

//     const contentImages = uploadedImages.map((url, i) => ({
//       imageUrl: url,
//       imageTitle: contentImagesMeta[i]?.imageTitle || '',  // Use image title from metadata
//       imageDetail: contentImagesMeta[i]?.imageDetail || '',  // Use image detail from metadata
//     }));

//     return this.blogsService.create({
//       title: body.title,
//       authorName: body.authorName,
//       descriptions: Array.isArray(body.descriptions) ? body.descriptions : [body.descriptions],
//       tags: Array.isArray(body.tags) ? body.tags : [body.tags],
//       categoryId: body.categoryId,
//       thumbnailImageUrl,
//       thumbnailVideoUrl,
//       contentImages,
//     });
//   }

//   // Update blog (admin only)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Patch(':id')
//   @UseInterceptors(
//     FileFieldsInterceptor([
//       { name: 'thumbnail', maxCount: 1 },  // optional on update
//       { name: 'contentImages', maxCount: 10 },  // optional on update
//     ]),
//   )
//   async update(
//     @Param('id') id: string,
//     @Body() body: any,
//     @UploadedFiles()
//     files: { thumbnail?: Express.Multer.File[]; contentImages?: Express.Multer.File[] },
//   ) {
//     const patch: any = {};

//     // Update text fields (title, author, descriptions, etc.)
//     if (body.title !== undefined) patch.title = body.title;
//     if (body.authorName !== undefined) patch.authorName = body.authorName;
//     if (body.categoryId !== undefined) patch.categoryId = body.categoryId;

//     // Handle descriptions
//     if (body['descriptions[]'] !== undefined || body.descriptions !== undefined) {
//       patch.descriptions = Array.isArray(body['descriptions[]'] || body.descriptions)
//         ? body['descriptions[]'] || body.descriptions
//         : [];
//     }

//     // Handle tags
//     if (body['tags[]'] !== undefined || body.tags !== undefined) {
//       patch.tags = Array.isArray(body['tags[]'] || body.tags)
//         ? body['tags[]'] || body.tags
//         : [];
//     }

//     // Handle the thumbnail (image/video)
//     if (files.thumbnail?.[0]) {
//       const thumbUrl = await this.blogUpload.uploadOne('blogs/thumbnail', files.thumbnail[0]);
//       const isImage = files.thumbnail[0].mimetype.startsWith('image/');
//       const isVideo = files.thumbnail[0].mimetype.startsWith('video/');
//       patch.thumbnailImageUrl = isImage ? thumbUrl : undefined;
//       patch.thumbnailVideoUrl = isVideo ? thumbUrl : undefined;
//     }

//     // Handle content images: process both existing (with IDs) and new images
//     const contentFiles = files.contentImages || [];
//     let contentImagesMeta = [];

//     try {
//       contentImagesMeta = body.contentImagesMeta ? JSON.parse(body.contentImagesMeta) : [];
//     } catch (error) {
//       throw new BadRequestException('contentImagesMeta must be a valid JSON array');
//     }

//     // Process content images
//     if (contentFiles.length > 0 || contentImagesMeta.length > 0) {
//       const contentImages = [];

//       // Get existing content images to preserve URLs when updating
//       const existingImages = await this.blogsService.getContentImages(id);
//       const existingImagesMap = new Map(existingImages.map(img => [img.id, img]));

//       // Handle new uploaded files
//       if (contentFiles.length > 0) {
//         const uploadedImages = await this.blogUpload.uploadMany('blogs/content', contentFiles);

//         // Map uploaded files to content images
//         uploadedImages.forEach((url, i) => {
//           const meta = contentImagesMeta[i];
//           if (meta && meta.id) {
//             // This is an existing image being updated with a new file
//             contentImages.push({
//               id: meta.id,
//               imageUrl: url, // Use the new uploaded URL
//               imageTitle: meta.imageTitle || '',
//               imageDetail: meta.imageDetail || '',
//             });
//           } else {
//             // This is a new image
//             contentImages.push({
//               imageUrl: url,
//               imageTitle: meta?.imageTitle || '',
//               imageDetail: meta?.imageDetail || '',
//             });
//           }
//         });
//       }

//       // Handle existing images that are being updated (with IDs but no new file)
//       contentImagesMeta.forEach((meta, i) => {
//         // If this meta has an ID and no corresponding uploaded file, it's a metadata-only update
//         if (meta.id && i >= contentFiles.length) {
//           const existingImage = existingImagesMap.get(meta.id);
//           const imageData = {
//             id: meta.id,
//             imageUrl: meta.imageUrl || existingImage?.imageUrl || '', // Use provided URL or existing URL
//             imageTitle: meta.imageTitle || '',
//             imageDetail: meta.imageDetail || '',
//           };
//           console.log('Processing existing image update (metadata only):', imageData);
//           contentImages.push(imageData);
//         }
//       });

//       console.log('Final content images to process:', contentImages);
//       patch.contentImages = contentImages;
//     }

//     // Call the service to update the blog with the new data
//     return this.blogsService.update(id, patch);
//   }
//   //   // ---------- USER ----------
//   @UseGuards(JwtAuthGuard)
//   @Get()
//   findAll() {
//     return this.blogsService.findAll();
//   }

//   @UseGuards(JwtAuthGuard)
//   @Get(':id')
//   findOne(@Param('id') id: string) {
//     return this.blogsService.findOne(id);
//   }

//   // Update a single content image (admin only)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Patch(':id/content-images/:imageId')
//   @UseInterceptors(
//     FileFieldsInterceptor([
//       { name: 'image', maxCount: 1 }, // Optional new image file
//     ]),
//   )
//   async updateContentImage(
//     @Param('id') blogId: string,
//     @Param('imageId') imageId: string,
//     @Body() body: { imageTitle?: string; imageDetail?: string },
//     @UploadedFiles() files: { image?: Express.Multer.File[] }
//   ) {
//     let imageUrl: string | undefined;

//     // Handle new image file upload
//     if (files.image?.[0]) {
//       imageUrl = await this.blogUpload.uploadOne('blogs/content', files.image[0]);
//     }

//     return this.blogsService.updateContentImage(blogId, imageId, {
//       imageTitle: body.imageTitle,
//       imageDetail: body.imageDetail,
//       imageUrl: imageUrl,
//     });
//   }

//   // Delete specific content images (admin only)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Delete(':id/content-images')
//   deleteContentImages(
//     @Param('id') id: string,
//     @Body() body: { contentImageIds: string[] }
//   ) {
//     return this.blogsService.deleteContentImages(id, body.contentImageIds);
//   }

//   // Delete blog (admin only)
//   @UseGuards(JwtAuthGuard, RolesGuard)
//   @Delete(':id')
//   remove(@Param('id') id: string) {
//     return this.blogsService.remove(id);
//   }
// }
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
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BlogUploadService } from './blog-upload.service';
import { BlogsService } from './blog.service';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly blogUpload: BlogUploadService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'contentImages', maxCount: 10 },
    ]),
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
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'thumbnail', maxCount: 1 },
      { name: 'contentImages', maxCount: 10 },
    ]),
  )
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles()
    files: { thumbnail?: Express.Multer.File[]; contentImages?: Express.Multer.File[] },
  ) {
    const patch: any = {};

    if (body.title !== undefined) patch.title = body.title;
    if (body.authorName !== undefined) patch.authorName = body.authorName;
    if (body.categoryId !== undefined) patch.categoryId = body.categoryId;

    if (body['descriptions[]'] !== undefined || body.descriptions !== undefined) {
      patch.descriptions = Array.isArray(body['descriptions[]'] || body.descriptions)
        ? body['descriptions[]'] || body.descriptions
        : [];
    }

    if (body['tags[]'] !== undefined || body.tags !== undefined) {
      patch.tags = Array.isArray(body['tags[]'] || body.tags)
        ? body['tags[]'] || body.tags
        : [];
    }

    if (files.thumbnail?.[0]) {
      const thumbUrl = await this.blogUpload.uploadOne('blogs/thumbnail', files.thumbnail[0]);
      const isImage = files.thumbnail[0].mimetype.startsWith('image/');
      const isVideo = files.thumbnail[0].mimetype.startsWith('video/');
      patch.thumbnailImageUrl = isImage ? thumbUrl : undefined;
      patch.thumbnailVideoUrl = isVideo ? thumbUrl : undefined;
    }

    const contentFiles = files.contentImages || [];
    let contentImagesMeta = [];

    try {
      contentImagesMeta = body.contentImagesMeta ? JSON.parse(body.contentImagesMeta) : [];
    } catch (error) {
      throw new BadRequestException('contentImagesMeta must be a valid JSON array');
    }

    if (contentFiles.length > 0 || contentImagesMeta.length > 0) {
      const contentImages = [];
      const existingImages = await this.blogsService.getContentImages(id);
      const existingImagesMap = new Map(existingImages.map((img) => [img.id, img]));

      if (contentFiles.length > 0) {
        const uploadedImages = await this.blogUpload.uploadMany('blogs/content', contentFiles);

        uploadedImages.forEach((url, i) => {
          const meta = contentImagesMeta[i];
          if (meta && meta.id) {
            contentImages.push({
              id: meta.id,
              imageUrl: url,
              imageTitle: meta.imageTitle || '',
              imageDetail: meta.imageDetail || '',
            });
          } else {
            contentImages.push({
              imageUrl: url,
              imageTitle: meta?.imageTitle || '',
              imageDetail: meta?.imageDetail || '',
            });
          }
        });
      }

      contentImagesMeta.forEach((meta, i) => {
        if (meta.id && i >= contentFiles.length) {
          const existingImage = existingImagesMap.get(meta.id);
          const imageData = {
            id: meta.id,
            imageUrl: meta.imageUrl || existingImage?.imageUrl || '',
            imageTitle: meta.imageTitle || '',
            imageDetail: meta.imageDetail || '',
          };
          contentImages.push(imageData);
        }
      });

      patch.contentImages = contentImages;
    }

    return this.blogsService.update(id, patch);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.blogsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/content-images/:imageId')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'image', maxCount: 1 }]))
  async updateContentImage(
    @Param('id') blogId: string,
    @Param('imageId') imageId: string,
    @Body() body: { imageTitle?: string; imageDetail?: string },
    @UploadedFiles() files: { image?: Express.Multer.File[] },
  ) {
    let imageUrl: string | undefined;

    if (files.image?.[0]) {
      imageUrl = await this.blogUpload.uploadOne('blogs/content', files.image[0]);
    }

    return this.blogsService.updateContentImage(blogId, imageId, {
      imageTitle: body.imageTitle,
      imageDetail: body.imageDetail,
      imageUrl,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id/content-images')
  deleteContentImages(@Param('id') id: string, @Body() body: { contentImageIds: string[] }) {
    return this.blogsService.deleteContentImages(id, body.contentImageIds);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogsService.remove(id);
  }
}


