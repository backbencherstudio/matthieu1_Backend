<<<<<<< HEAD
// // src/modules/blogs/blogs.service.ts
// import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { BlogUploadService } from './blog-upload.service';

// @Injectable()
// export class BlogsService {
//   constructor(
//     private prisma: PrismaService,
//     private blogUpload: BlogUploadService,
//   ) { }

//   // Create a new blog
//   async create(data: any) {
//     const isPublished = data.status === 'PUBLISHED';

//     const blog = await this.prisma.blog.create({
//       data: {
//         title: data.title,
//         authorName: data.authorName,
//         thumbnailImageUrl: data.thumbnailImageUrl,
//         thumbnailVideoUrl: data.thumbnailVideoUrl,
//         tags: data.tags,
//         categoryId: data.categoryId,
//         status: data.status || 'DRAFT',
//         publishedAt: isPublished ? new Date() : null,
//         descriptions: {
//           create: (data.descriptions || []).map((d: string) => ({ text: d })),
//         },
//         contentImages: {
//           create: (data.contentImages || []).map((ci) => ({
//             imageUrl: ci.imageUrl,
//             imageTitle: ci.imageTitle,
//             imageDetail: ci.imageDetail,
//           })),
//         },
//       },
//       include: { category: true, contentImages: true, descriptions: true },
//     });
//     return blog;
//   }

//   // Update a blog
//   async update(id: string, data: any) {
//     const blog = await this.prisma.blog.findUnique({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     const updateData: any = {
//       title: data.title,
//       authorName: data.authorName,
//       tags: data.tags,
//       categoryId: data.categoryId,
//     };

//     // Handle thumbnail updates - delete old files if replacing
//     if (data.thumbnailImageUrl !== undefined) {
//       // If replacing with a new image, delete the old one
//       if (data.thumbnailImageUrl && blog.thumbnailImageUrl && data.thumbnailImageUrl !== blog.thumbnailImageUrl) {
//         // console.log('Deleting old thumbnail image:', blog.thumbnailImageUrl);
//         await this.blogUpload.deleteOne(blog.thumbnailImageUrl);
//       }
//       updateData.thumbnailImageUrl = data.thumbnailImageUrl;
//     }
//     if (data.thumbnailVideoUrl !== undefined) {
//       // If replacing with a new video, delete the old one
//       if (data.thumbnailVideoUrl && blog.thumbnailVideoUrl && data.thumbnailVideoUrl !== blog.thumbnailVideoUrl) {
//         // console.log('Deleting old thumbnail video:', blog.thumbnailVideoUrl);
//         await this.blogUpload.deleteOne(blog.thumbnailVideoUrl);
//       }
//       updateData.thumbnailVideoUrl = data.thumbnailVideoUrl;
//     }

//     // Handle status updates
//     if (data.status) {
//       if (blog.status === 'PUBLISHED' && data.status === 'DRAFT') {
//         throw new BadRequestException('Cannot change status from PUBLISHED to DRAFT');
//       }
//       if (blog.status === 'DRAFT' && data.status === 'PUBLISHED') {
//         updateData.status = 'PUBLISHED';
//         updateData.publishedAt = new Date();
//       } else {
//         updateData.status = data.status;
//       }
//     }

//     // Handle descriptions - only add new ones if provided
//     if (data.descriptions && Array.isArray(data.descriptions) && data.descriptions.length > 0) {
//       updateData.descriptions = {
//         create: data.descriptions.map((d: string) => ({ text: d })),
//       };
//     }

//     // Handle content images - only add new ones if provided
//     if (data.contentImages && Array.isArray(data.contentImages) && data.contentImages.length > 0) {
//       updateData.contentImages = {
//         create: data.contentImages.map((ci) => ({
//           imageUrl: ci.imageUrl,
//           imageTitle: ci.imageTitle,
//           imageDetail: ci.imageDetail,
//         })),
//       };
//     }

//     return this.prisma.blog.update({
//       where: { id },
//       data: updateData,
//       include: { category: true, contentImages: true, descriptions: true },
//     });
//   }


//   // Update a specific description
//   async updateDescription(
//     blogId: string,
//     descriptionId: string,
//     text: string,
//   ) {
//     const description = await this.prisma.blogDescription.findFirst({
//       where: { id: descriptionId, blogId },
//     });
//     if (!description) throw new NotFoundException('Description not found');

//     return this.prisma.blogDescription.update({
//       where: { id: descriptionId },
//       data: { text },
//     });
//   }

//   // Update a specific content image
//   async updateContentImage(
//     blogId: string,
//     imageId: string,
//     data: { imageUrl?: string; imageTitle?: string; imageDetail?: string },
//   ) {
//     const image = await this.prisma.blogContentImage.findFirst({
//       where: { id: imageId, blogId },
//     });
//     if (!image) throw new NotFoundException('Content image not found');

//     // console.log('Service - updateContentImage received data:', data);
//     // console.log('Service - current image data:', image);

//     // Only include fields that are actually provided (not undefined)
//     const updateData: any = {};

//     // If updating with a new image URL, delete the old image file
//     if (data.imageUrl !== undefined && data.imageUrl !== null) {
//       if (data.imageUrl && image.imageUrl && data.imageUrl !== image.imageUrl) {
//         // console.log('Deleting old content image:', image.imageUrl);
//         await this.blogUpload.deleteOne(image.imageUrl);
//       }
//       updateData.imageUrl = data.imageUrl;
//     }

//     if (data.imageTitle !== undefined && data.imageTitle !== null) {
//       updateData.imageTitle = data.imageTitle;
//     }
//     if (data.imageDetail !== undefined && data.imageDetail !== null) {
//       updateData.imageDetail = data.imageDetail;
//     }

//     // console.log('Service - updateContentImage updateData:', updateData);

//     // If no fields to update, return current image
//     if (Object.keys(updateData).length === 0) {
//       // console.log('Service - No fields to update, returning current image');
//       return image;
//     }

//     const result = await this.prisma.blogContentImage.update({
//       where: { id: imageId },
//       data: updateData,
//     });

//     // console.log('Service - updateContentImage result:', result);
//     return result;
//   }


//   // Get all content images for a blog
//   async getContentImages(blogId: string) {
//     const blog = await this.prisma.blog.findUnique({
//       where: { id: blogId },
//       select: { contentImages: true },
//     });
//     return blog?.contentImages || [];
//   }

//   // Add a new content image to a blog
//   async addContentImage(blogId: string, data: { imageUrl: string; imageTitle: string; imageDetail: string }) {
//     // Verify blog exists
//     const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     // console.log('Service - addContentImage received data:', data);

//     const contentImage = await this.prisma.blogContentImage.create({
//       data: {
//         imageUrl: data.imageUrl,
//         imageTitle: data.imageTitle,
//         imageDetail: data.imageDetail,
//         blogId: blogId,
//       },
//     });

//     // console.log('Service - addContentImage result:', contentImage);
//     return contentImage;
//   }

//   // Get all blogs info for Admin with pagination and search
//   async findAll(params?: { page?: number; limit?: number; search?: string; status?: 'PUBLISHED' | 'DRAFT'; categoryId?: string; year?: number; month?: number; }) {
//     const page = Math.max(1, Number(params?.page ?? 1));
//     const limitRaw = Number(params?.limit ?? 10);
//     const limit = Math.max(1, Math.min(100, isNaN(limitRaw) ? 10 : limitRaw));
//     const search = (params?.search ?? '').toString().trim();

//     const where: any = {};
//     if (params?.status) {
//       where.status = params.status;
//     }
//     if (params?.categoryId) {
//       where.categoryId = params.categoryId;
//     }
//     if (search.length > 0) {
//       where.OR = [
//         { title: { contains: search, mode: 'insensitive' } },
//         { authorName: { contains: search, mode: 'insensitive' } },
//         { tags: { has: search } },
//         { descriptions: { some: { text: { contains: search, mode: 'insensitive' } } } },
//       ];
//     }

//     // Date filter on created_at by year and optional month
//     if (params?.year) {
//       const yearNum = Number(params.year);
//       const hasMonth = params.month !== undefined && params.month !== null;
//       const monthNum = hasMonth ? Math.min(12, Math.max(1, Number(params.month))) : undefined; // 1..12

//       const start = hasMonth
//         ? new Date(Date.UTC(yearNum, (monthNum as number) - 1, 1, 0, 0, 0))
//         : new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0));
//       const end = hasMonth
//         ? new Date(Date.UTC(yearNum, (monthNum as number), 1, 0, 0, 0))
//         : new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0));

//       where.created_at = { gte: start, lt: end };
//     }

//     const [items, total] = await this.prisma.$transaction([
//       this.prisma.blog.findMany({
//         where,
//         include: { category: true, contentImages: true, descriptions: true },
//         orderBy: { created_at: 'desc' },
//         skip: (page - 1) * limit,
//         take: limit,
//       }),
//       this.prisma.blog.count({ where }),
//     ]);

//     return {
//       data: items,
//       meta: {
//         page,
//         limit,
//         total,
//         totalPages: Math.max(1, Math.ceil(total / limit)),
//       },
//     };
//   }

//   // Get only published blogs with limited fields
//   async findPublished() {
//     return this.prisma.blog.findMany({
//       where: { status: 'PUBLISHED' },
//       select: {
//         id: true,
//         title: true,
//         thumbnailImageUrl: true,
//         publishedAt: true,
//       },
//       orderBy: { publishedAt: 'desc' },
//     });
//   }

//   // Get one published blog with limited fields and increment clicks
//   async findPublishedOne(id: string) {
//     // Ensure the blog exists and is published
//     const existing = await this.prisma.blog.findFirst({
//       where: { id, status: 'PUBLISHED' },
//       select: { id: true },
//     });

//     if (!existing) {
//       throw new NotFoundException('Published blog not found');
//     }

//     // Atomically increment clicks and return the selected fields
//     const updated = await this.prisma.blog.update({
//       where: { id: existing.id },
//       // Cast due to possible stale Prisma types in editor
//       data: ({ clicks: { increment: 1 } } as any),
//       select: {
//         id: true,
//         title: true,
//         thumbnailImageUrl: true,
//         publishedAt: true,
//         descriptions: {
//           select: { id: true, text: true },
//         },
//         contentImages: {
//           select: {
//             id: true,
//             imageUrl: true,
//             imageTitle: true,
//             imageDetail: true,
//           },
//         },
//       },
//     });

//     return updated;
//   }



//   async findOne(id: string) {
//     const blog = await this.prisma.blog.findUnique({
//       where: { id },
//       include: { category: true, contentImages: true, descriptions: true },
//     });
//     if (!blog) throw new NotFoundException('Blog not found');
//     return blog;
//   }

//   async remove(id: string) {
//     // Get blog with all related data before deletion
//     const blog = await this.findOne(id);

//     console.log(`Deleting blog ${id} with files:`, {
//       thumbnailImage: blog.thumbnailImageUrl,
//       thumbnailVideo: blog.thumbnailVideoUrl,
//       contentImagesCount: blog.contentImages?.length || 0,
//     });

//     // Collect all files to delete
//     const filesToDelete: string[] = [];

//     if (blog.thumbnailImageUrl) {
//       filesToDelete.push(blog.thumbnailImageUrl);
//     }
//     if (blog.thumbnailVideoUrl) {
//       filesToDelete.push(blog.thumbnailVideoUrl);
//     }
//     if (blog.contentImages && blog.contentImages.length > 0) {
//       blog.contentImages.forEach(img => {
//         if (img.imageUrl) {
//           filesToDelete.push(img.imageUrl);
//         }
//       });
//     }

//     // Delete all associated files from storage
//     if (filesToDelete.length > 0) {
//       await this.blogUpload.deleteMany(filesToDelete);
//     }

//     // Delete blog from database (will cascade delete contentImages and descriptions)
//     await this.prisma.blog.delete({ where: { id } });

//     return { message: 'Blog and associated files deleted successfully' };
//   }

//   async deleteContentImage(blogId: string, imageId: string) {
//     // console.log('Service - deleteContentImage received:', { blogId, imageId });

//     // First check if the content image exists and belongs to the blog
//     const contentImage = await this.prisma.blogContentImage.findFirst({
//       where: { id: imageId, blogId },
//     });

//     if (!contentImage) {
//       throw new NotFoundException('Content image not found or does not belong to this blog');
//     }

//     // console.log('Service - Found content image to delete:', contentImage);

//     // Delete the image file from storage
//     if (contentImage.imageUrl) {
//       // console.log('Deleting content image file from storage:', contentImage.imageUrl);
//       await this.blogUpload.deleteOne(contentImage.imageUrl);
//     }

//     // Delete the specific content image record from database
//     await this.prisma.blogContentImage.delete({
//       where: { id: imageId },
//     });

//     // console.log('Service - Content image and file deleted successfully');
//     return {
//       success: true,
//       message: 'Content image and file deleted successfully',
//       deletedImageId: imageId
//     };
//   }

//   // Keep the old method for backward compatibility if needed
//   async deleteContentImages(blogId: string, contentImageIds: string[]) {
//     if (contentImageIds.length === 0) return { message: 'No content images to delete' };

//     // Get all content images to delete their files
//     const contentImages = await this.prisma.blogContentImage.findMany({
//       where: { id: { in: contentImageIds }, blogId },
//       select: { imageUrl: true },
//     });

//     // Delete all image files from storage
//     const imageUrls = contentImages.map(img => img.imageUrl).filter(Boolean);
//     if (imageUrls.length > 0) {
//       // console.log(`Deleting ${imageUrls.length} content image files from storage`);
//       await this.blogUpload.deleteMany(imageUrls);
//     }

//     // Delete content image records from database
//     const deletedCount = await this.prisma.blogContentImage.deleteMany({
//       where: { id: { in: contentImageIds }, blogId },
//     });

//     return {
//       success: true,
//       message: `${deletedCount.count} content images and files deleted successfully`,
//       deletedCount: deletedCount.count
//     };
//   }
// }

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
=======
import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
import { PrismaService } from 'src/prisma/prisma.service';
import { BlogUploadService } from './blog-upload.service';
import { Blog_Category, BlogStatus } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(
<<<<<<< HEAD
    private readonly prisma: PrismaService,
    private readonly blogUpload: BlogUploadService,
  ) {}

  // CREATE BLOG
=======
    private prisma: PrismaService,
    private blogUpload: BlogUploadService,
  ) {}

  // =========================
  // CREATE BLOG
  // =========================
  // async create(data: any) {
  //   // Validate required fields
  //   const requiredFields = [
  //     'title',
  //     'authorName',
  //     'thumbnailImageUrl',
  //     'category',
  //   ];
  //   const missingFields = requiredFields.filter((field) => !data[field]);

  //   if (missingFields.length > 0) {
  //     throw new BadRequestException(
  //       `Missing required fields: ${missingFields.join(', ')}`,
  //     );
  //   }

  //   const isPublished = data.status === BlogStatus.PUBLISHED;

  //   try {
  //     return await this.prisma.blog.create({
  //       data: {
  //         title: data.title,
  //         authorName: data.authorName,
  //         thumbnailImageUrl: data.thumbnailImageUrl,
  //         thumbnailVideoUrl: data.thumbnailVideoUrl,
  //         descriptions: data.descriptions ?? null,
  //         tags: data.tags,
  //         category: data.category as Blog_Category,
  //         status: data.status ?? BlogStatus.DRAFT,
  //         publishedAt: isPublished ? new Date() : null,
  //         contentImages: {
  //           create: (data.contentImages || []).map((ci) => ({
  //             imageUrl: ci.imageUrl,
  //             imageTitle: ci.imageTitle,
  //             imageDetail: ci.imageDetail,
  //             imageDescription: ci.imageDescription ?? '',
  //           })),
  //         },
  //       },
  //       include: { contentImages: true },
  //     });
  //   } catch (error: any) {
  //     if (error instanceof BadRequestException) {
  //       throw error;
  //     }
  //     if (error instanceof Prisma.PrismaClientKnownRequestError) {
  //       throw new BadRequestException(error.message);
  //     }
  //     if (error?.name === 'PrismaClientValidationError') {
  //       throw new BadRequestException(error.message);
  //     }
  //     throw error;
  //   }
  // }

>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
  async create(data: any) {
    try {
      // Required fields validation
      const requiredFields = [
        'title',
        'authorName',
        'thumbnailImageUrl',
        'category',
      ];

<<<<<<< HEAD
    return this.prisma.blog.create({
      data: {
        title: data.title,
        authorName: data.authorName,
        description: data.description,
        tags: data.tags,
        category: data.category,
        thumbnailImageUrl: data.thumbnailImageUrl,
        thumbnailVideoUrl: data.thumbnailVideoUrl,
        status: data.status ?? 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
        contentImages: {
          create: (data.contentImages || []).map(ci => ({
            imageUrl: ci.imageUrl,
            imageTitle: ci.imageTitle,
            imageDetail: ci.imageDetail,
            imageDescription: ci.imageDescription,
          })),
        },
      },
      include: { contentImages: true },
    });
  }

  // UPDATE BLOG
  async update(id: string, data: any) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    if (blog.status === 'PUBLISHED' && data.status === 'DRAFT') {
      throw new BadRequestException(
        'Cannot change status from PUBLISHED to DRAFT',
      );
    }

    return this.prisma.blog.update({
      where: { id },
      data,
      include: { contentImages: true },
    });
  }

  // GET ALL (ADMIN)
  async findAll(query: any) {
    const page = Math.max(1, Number(query.page ?? 1));
    const limit = Math.min(100, Number(query.limit ?? 10));

    const where: any = {};
    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { authorName: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
=======
      const missingFields = requiredFields.filter((field) => !data[field]);

      if (missingFields.length) {
        throw new BadRequestException(
          `Missing required fields: ${missingFields.join(', ')}`,
        );
      }

      // Validate category
      if (!Object.values(Blog_Category).includes(data.category)) {
        throw new BadRequestException('Invalid blog category');
      }

      // Validate status
      if (data.status && !Object.values(BlogStatus).includes(data.status)) {
        throw new BadRequestException('Invalid blog status');
      }

      // Sanitize tags
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((t) => typeof t === 'string' && t.trim() !== '')
        : [];

      const isPublished = data.status === BlogStatus.PUBLISHED;

      // Validate content images
      const contentImages = (data.contentImages || []).map((ci: any) => {
        if (!ci.imageUrl) {
          throw new BadRequestException('Content image must contain imageUrl');
        }

        return {
          imageUrl: ci.imageUrl,
          imageTitle: ci.imageTitle || '',
          imageDetail: ci.imageDetail || '',
          imageDescription: ci.imageDescription || '',
        };
      });

      return await this.prisma.blog.create({
        data: {
          title: data.title,
          authorName: data.authorName,
          thumbnailImageUrl: data.thumbnailImageUrl,
          thumbnailVideoUrl: data.thumbnailVideoUrl ?? null,
          descriptions: data.descriptions ?? null,
          tags,
          category: data.category,
          status: data.status ?? BlogStatus.DRAFT,
          publishedAt: isPublished ? new Date() : null,

          contentImages: {
            create: contentImages,
          },
        },
        include: {
          contentImages: true,
        },
      });
    } catch (error: any) {
      if (error instanceof HttpException) throw error;

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }

      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }

      throw new InternalServerErrorException(
        error?.message || 'Blog creation failed',
      );
    }
  }

  // =========================
  // UPDATE BLOG
  // =========================
  async update(id: string, data: any) {
    try {
      const blog = await this.prisma.blog.findUnique({ where: { id } });
      if (!blog) throw new NotFoundException('Blog not found');

      const updateData: any = {
        title: data.title,
        authorName: data.authorName,
        tags: data.tags,
        descriptions: data.descriptions,
        category: data.category,
      };

      // Thumbnail image update
      if (data.thumbnailImageUrl !== undefined) {
        if (
          data.thumbnailImageUrl &&
          blog.thumbnailImageUrl &&
          data.thumbnailImageUrl !== blog.thumbnailImageUrl
        ) {
          await this.blogUpload.deleteOne(blog.thumbnailImageUrl);
        }
        updateData.thumbnailImageUrl = data.thumbnailImageUrl;
      }

      // Thumbnail video update
      if (data.thumbnailVideoUrl !== undefined) {
        if (
          data.thumbnailVideoUrl &&
          blog.thumbnailVideoUrl &&
          data.thumbnailVideoUrl !== blog.thumbnailVideoUrl
        ) {
          await this.blogUpload.deleteOne(blog.thumbnailVideoUrl);
        }
        updateData.thumbnailVideoUrl = data.thumbnailVideoUrl;
      }

      // Status handling
      if (data.status) {
        if (
          blog.status === BlogStatus.PUBLISHED &&
          data.status === BlogStatus.DRAFT
        ) {
          throw new BadRequestException(
            'Cannot change status from PUBLISHED to DRAFT',
          );
        }

        if (
          blog.status === BlogStatus.DRAFT &&
          data.status === BlogStatus.PUBLISHED
        ) {
          updateData.status = BlogStatus.PUBLISHED;
          updateData.publishedAt = new Date();
        } else {
          updateData.status = data.status;
        }
      }

      // Add new content images if provided
      if (Array.isArray(data.contentImages) && data.contentImages.length > 0) {
        updateData.contentImages = {
          create: data.contentImages.map((ci) => ({
            imageUrl: ci.imageUrl,
            imageTitle: ci.imageTitle,
            imageDetail: ci.imageDetail,
            imageDescription: ci.imageDescription ?? '',
          })),
        };
      }

      return await this.prisma.blog.update({
        where: { id },
        data: updateData,
        include: { contentImages: true },
      });
    } catch (error: any) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException(error.message);
      }
      if (error?.name === 'PrismaClientValidationError') {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // =========================
  // UPDATE CONTENT IMAGE
  // =========================
  async updateContentImage(
    blogId: string,
    imageId: string,
    data: {
      imageUrl?: string;
      imageTitle?: string;
      imageDetail?: string;
      imageDescription?: string;
    },
  ) {
    const image = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
    });
    if (!image) throw new NotFoundException('Content image not found');

    const updateData: any = {};

    if (data.imageUrl !== undefined) {
      if (data.imageUrl && image.imageUrl && data.imageUrl !== image.imageUrl) {
        await this.blogUpload.deleteOne(image.imageUrl);
      }
      updateData.imageUrl = data.imageUrl;
    }

    if (data.imageTitle !== undefined) updateData.imageTitle = data.imageTitle;
    if (data.imageDetail !== undefined)
      updateData.imageDetail = data.imageDetail;
    if (data.imageDescription !== undefined)
      updateData.imageDescription = data.imageDescription;

    if (Object.keys(updateData).length === 0) return image;

    return this.prisma.blogContentImage.update({
      where: { id: imageId },
      data: updateData,
    });
  }

  // =========================
  // GET CONTENT IMAGES
  // =========================
  async getContentImages(blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { contentImages: true },
    });
    return blog?.contentImages || [];
  }

  // =========================
  // ADD CONTENT IMAGE
  // =========================
  async addContentImage(
    blogId: string,
    data: {
      imageUrl: string;
      imageTitle: string;
      imageDetail: string;
      imageDescription?: string;
    },
  ) {
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    return this.prisma.blogContentImage.create({
      data: {
        imageUrl: data.imageUrl,
        imageTitle: data.imageTitle,
        imageDetail: data.imageDetail,
        imageDescription: data.imageDescription ?? '',
        blogId,
      },
    });
  }

  // =========================
  // FIND ALL (ADMIN)
  // =========================
  async findAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: BlogStatus;
    category?: Blog_Category;
  }) {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, params?.limit ?? 10);

    const where: any = {};

    if (params?.status) where.status = params.status;
    if (params?.category) where.category = params.category;

    if (params?.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { authorName: { contains: params.search, mode: 'insensitive' } },
        { tags: { has: params.search } },
        { descriptions: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await this.prisma.$transaction([
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
      this.prisma.blog.findMany({
        where,
        include: { contentImages: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

<<<<<<< HEAD
  // GET ONE
=======
  // =========================
  // FIND PUBLISHED
  // =========================
  async findPublished() {
    return this.prisma.blog.findMany({
      where: { status: BlogStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        thumbnailImageUrl: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  // =========================
  // FIND ONE PUBLISHED + CLICK++
  // =========================
  async findPublishedOne(id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, status: BlogStatus.PUBLISHED },
    });
    if (!blog) throw new NotFoundException('Published blog not found');

    return this.prisma.blog.update({
      where: { id },
      data: { clicks: { increment: 1 } },
      include: { contentImages: true },
    });
  }

  // =========================
  // FIND ONE
  // =========================
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { contentImages: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

<<<<<<< HEAD
  // GET PUBLISHED
  async findPublished() {
    return this.prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
    });
  }

  // GET PUBLISHED ONE + CLICK
  async findPublishedOne(id: string) {
    const blog = await this.prisma.blog.findFirst({
      where: { id, status: 'PUBLISHED' },
    });
    if (!blog) throw new NotFoundException('Blog not found');

    return this.prisma.blog.update({
      where: { id },
      data: { clicks: { increment: 1 } },
      include: { contentImages: true },
    });
  }

  // ADD CONTENT IMAGE
  async addContentImage(blogId: string, data: any) {
    return this.prisma.blogContentImage.create({
      data: {
        blogId,
        imageUrl: data.imageUrl,
        imageTitle: data.imageTitle,
        imageDetail: data.imageDetail,
        imagedescription: data.imageDescription,
      },
    });
  }

  // UPDATE CONTENT IMAGE
  async updateContentImage(blogId: string, imageId: string, data: any) {
=======
  // =========================
  // DELETE BLOG
  // =========================
  async remove(id: string) {
    const blog = await this.findOne(id);

    const files: string[] = [];
    if (blog.thumbnailImageUrl) files.push(blog.thumbnailImageUrl);
    if (blog.thumbnailVideoUrl) files.push(blog.thumbnailVideoUrl);
    blog.contentImages.forEach((img) => files.push(img.imageUrl));

    await this.blogUpload.deleteMany(files);
    await this.prisma.blog.delete({ where: { id } });

    return { message: 'Blog and associated files deleted successfully' };
  }

  // =========================
  // DELETE SINGLE CONTENT IMAGE
  // =========================
  async deleteContentImage(blogId: string, imageId: string) {
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
    const image = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
    });
    if (!image) throw new NotFoundException('Content image not found');

<<<<<<< HEAD
    if (data.imageUrl && image.imageUrl !== data.imageUrl) {
      await this.blogUpload.deleteOne(image.imageUrl);
    }

    return this.prisma.blogContentImage.update({
      where: { id: imageId },
      data,
    });
  }

  // DELETE CONTENT IMAGE
  async deleteContentImage(blogId: string, imageId: string) {
    const image = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
=======
    await this.blogUpload.deleteOne(image.imageUrl);
    await this.prisma.blogContentImage.delete({ where: { id: imageId } });

    return { success: true, deletedImageId: imageId };
  }

  // =========================
  // DELETE MULTIPLE CONTENT IMAGES
  // =========================
  async deleteContentImages(blogId: string, contentImageIds: string[]) {
    if (!contentImageIds.length)
      return { message: 'No content images to delete' };

    const images = await this.prisma.blogContentImage.findMany({
      where: { id: { in: contentImageIds }, blogId },
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
    });
    if (!image) throw new NotFoundException('Content image not found');

<<<<<<< HEAD
    await this.blogUpload.deleteOne(image.imageUrl);
    await this.prisma.blogContentImage.delete({ where: { id: imageId } });

    return { success: true };
  }

  // DELETE BLOG
  async remove(id: string) {
    const blog = await this.findOne(id);

    const files = [
      blog.thumbnailImageUrl,
      blog.thumbnailVideoUrl,
      ...blog.contentImages.map(i => i.imageUrl),
    ].filter(Boolean);

    if (files.length) {
      await this.blogUpload.deleteMany(files);
    }

    await this.prisma.blog.delete({ where: { id } });

    return { message: 'Blog deleted successfully' };
=======
    await this.blogUpload.deleteMany(images.map((i) => i.imageUrl));
    await this.prisma.blogContentImage.deleteMany({
      where: { id: { in: contentImageIds }, blogId },
    });

    return {
      success: true,
      deletedCount: contentImageIds.length,
    };
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
  }
}
