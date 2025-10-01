// src/modules/blogs/blogs.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) { }

  // Create a new blog
  async create(data: any) {
    const isPublished = data.status === 'PUBLISHED';

    const blog = await this.prisma.blog.create({
      data: {
        title: data.title,
        authorName: data.authorName,
        thumbnailImageUrl: data.thumbnailImageUrl,
        thumbnailVideoUrl: data.thumbnailVideoUrl,
        tags: data.tags,
        categoryId: data.categoryId,
        status: data.status || 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
        descriptions: {
          create: (data.descriptions || []).map((d: string) => ({ text: d })),
        },
        contentImages: {
          create: (data.contentImages || []).map((ci) => ({
            imageUrl: ci.imageUrl,
            imageTitle: ci.imageTitle,
            imageDetail: ci.imageDetail,
          })),
        },
      },
      include: { category: true, contentImages: true, descriptions: true },
    });
    return blog;
  }

  // Update a blog
  async update(id: string, data: any) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    const updateData: any = {
      title: data.title,
      authorName: data.authorName,
      tags: data.tags,
      categoryId: data.categoryId,
    };

    // Handle thumbnail updates
    if (data.thumbnailImageUrl !== undefined) {
      updateData.thumbnailImageUrl = data.thumbnailImageUrl;
    }
    if (data.thumbnailVideoUrl !== undefined) {
      updateData.thumbnailVideoUrl = data.thumbnailVideoUrl;
    }

    // Handle status updates
    if (data.status) {
      if (blog.status === 'PUBLISHED' && data.status === 'DRAFT') {
        throw new BadRequestException('Cannot change status from PUBLISHED to DRAFT');
      }
      if (blog.status === 'DRAFT' && data.status === 'PUBLISHED') {
        updateData.status = 'PUBLISHED';
        updateData.publishedAt = new Date();
      } else {
        updateData.status = data.status;
      }
    }

    // Handle descriptions - only add new ones if provided
    if (data.descriptions && Array.isArray(data.descriptions) && data.descriptions.length > 0) {
      updateData.descriptions = {
        create: data.descriptions.map((d: string) => ({ text: d })),
      };
    }

    // Handle content images - only add new ones if provided
    if (data.contentImages && Array.isArray(data.contentImages) && data.contentImages.length > 0) {
      updateData.contentImages = {
        create: data.contentImages.map((ci) => ({
          imageUrl: ci.imageUrl,
          imageTitle: ci.imageTitle,
          imageDetail: ci.imageDetail,
        })),
      };
    }

    return this.prisma.blog.update({
      where: { id },
      data: updateData,
      include: { category: true, contentImages: true, descriptions: true },
    });
  }


  // Update a specific description
  async updateDescription(
    blogId: string,
    descriptionId: string,
    text: string,
  ) {
    const description = await this.prisma.blogDescription.findFirst({
      where: { id: descriptionId, blogId },
    });
    if (!description) throw new NotFoundException('Description not found');

    return this.prisma.blogDescription.update({
      where: { id: descriptionId },
      data: { text },
    });
  }

  // Update a specific content image
  async updateContentImage(
    blogId: string,
    imageId: string,
    data: { imageUrl?: string; imageTitle?: string; imageDetail?: string },
  ) {
    const image = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
    });
    if (!image) throw new NotFoundException('Content image not found');

    console.log('Service - updateContentImage received data:', data);
    console.log('Service - current image data:', image);

    // Only include fields that are actually provided (not undefined)
    const updateData: any = {};
    if (data.imageUrl !== undefined && data.imageUrl !== null) {
      updateData.imageUrl = data.imageUrl;
    }
    if (data.imageTitle !== undefined && data.imageTitle !== null) {
      updateData.imageTitle = data.imageTitle;
    }
    if (data.imageDetail !== undefined && data.imageDetail !== null) {
      updateData.imageDetail = data.imageDetail;
    }

    console.log('Service - updateContentImage updateData:', updateData);

    // If no fields to update, return current image
    if (Object.keys(updateData).length === 0) {
      console.log('Service - No fields to update, returning current image');
      return image;
    }

    const result = await this.prisma.blogContentImage.update({
      where: { id: imageId },
      data: updateData,
    });

    console.log('Service - updateContentImage result:', result);
    return result;
  }


  // Get all content images for a blog
  async getContentImages(blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { contentImages: true },
    });
    return blog?.contentImages || [];
  }

  // Add a new content image to a blog
  async addContentImage(blogId: string, data: { imageUrl: string; imageTitle: string; imageDetail: string }) {
    // Verify blog exists
    const blog = await this.prisma.blog.findUnique({ where: { id: blogId } });
    if (!blog) throw new NotFoundException('Blog not found');

    console.log('Service - addContentImage received data:', data);

    const contentImage = await this.prisma.blogContentImage.create({
      data: {
        imageUrl: data.imageUrl,
        imageTitle: data.imageTitle,
        imageDetail: data.imageDetail,
        blogId: blogId,
      },
    });

    console.log('Service - addContentImage result:', contentImage);
    return contentImage;
  }

  // Get all blogs info for Admin with pagination and search
  async findAll(params?: { page?: number; limit?: number; search?: string; status?: 'PUBLISHED' | 'DRAFT'; categoryId?: string; year?: number; month?: number; }) {
    const page = Math.max(1, Number(params?.page ?? 1));
    const limitRaw = Number(params?.limit ?? 10);
    const limit = Math.max(1, Math.min(100, isNaN(limitRaw) ? 10 : limitRaw));
    const search = (params?.search ?? '').toString().trim();

    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.categoryId) {
      where.categoryId = params.categoryId;
    }
    if (search.length > 0) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
        { descriptions: { some: { text: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    // Date filter on created_at by year and optional month
    if (params?.year) {
      const yearNum = Number(params.year);
      const hasMonth = params.month !== undefined && params.month !== null;
      const monthNum = hasMonth ? Math.min(12, Math.max(1, Number(params.month))) : undefined; // 1..12

      const start = hasMonth
        ? new Date(Date.UTC(yearNum, (monthNum as number) - 1, 1, 0, 0, 0))
        : new Date(Date.UTC(yearNum, 0, 1, 0, 0, 0));
      const end = hasMonth
        ? new Date(Date.UTC(yearNum, (monthNum as number), 1, 0, 0, 0))
        : new Date(Date.UTC(yearNum + 1, 0, 1, 0, 0, 0));

      where.created_at = { gte: start, lt: end };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.blog.findMany({
        where,
        include: { category: true, contentImages: true, descriptions: true },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blog.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  // Get only published blogs with limited fields
  async findPublished() {
    return this.prisma.blog.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        thumbnailImageUrl: true,
        publishedAt: true,
      },
      orderBy: { publishedAt: 'desc' },
    });
  }

  // Get one published blog with limited fields and increment clicks
  async findPublishedOne(id: string) {
    // Ensure the blog exists and is published
    const existing = await this.prisma.blog.findFirst({
      where: { id, status: 'PUBLISHED' },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Published blog not found');
    }

    // Atomically increment clicks and return the selected fields
    const updated = await this.prisma.blog.update({
      where: { id: existing.id },
      // Cast due to possible stale Prisma types in editor
      data: ({ clicks: { increment: 1 } } as any),
      select: {
        id: true,
        title: true,
        thumbnailImageUrl: true,
        publishedAt: true,
        descriptions: {
          select: { id: true, text: true },
        },
        contentImages: {
          select: {
            id: true,
            imageUrl: true,
            imageTitle: true,
            imageDetail: true,
          },
        },
      },
    });

    return updated;
  }



  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { category: true, contentImages: true, descriptions: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async remove(id: string) {
    await this.prisma.blog.delete({ where: { id } });
    return { message: 'Blog deleted' };
  }

  async deleteContentImage(blogId: string, imageId: string) {
    console.log('Service - deleteContentImage received:', { blogId, imageId });

    // First check if the content image exists and belongs to the blog
    const contentImage = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
    });

    if (!contentImage) {
      throw new NotFoundException('Content image not found or does not belong to this blog');
    }

    console.log('Service - Found content image to delete:', contentImage);

    // Delete the specific content image
    await this.prisma.blogContentImage.delete({
      where: { id: imageId },
    });

    console.log('Service - Content image deleted successfully');
    return {
      success: true,
      message: 'Content image deleted successfully',
      deletedImageId: imageId
    };
  }

  // Keep the old method for backward compatibility if needed
  async deleteContentImages(blogId: string, contentImageIds: string[]) {
    if (contentImageIds.length === 0) return { message: 'No content images to delete' };

    const deletedCount = await this.prisma.blogContentImage.deleteMany({
      where: { id: { in: contentImageIds }, blogId },
    });

    return {
      success: true,
      message: `${deletedCount.count} content images deleted successfully`,
      deletedCount: deletedCount.count
    };
  }
}

