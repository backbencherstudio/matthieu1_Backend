import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BlogUploadService } from './blog-upload.service';
import { Blog_Category, BlogStatus } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(
    private prisma: PrismaService,
    private blogUpload: BlogUploadService,
  ) {}

  // =========================
  // CREATE BLOG
  // =========================
  async create(data: any) {
    const isPublished = data.status === BlogStatus.PUBLISHED;

    return this.prisma.blog.create({
      data: {
        title: data.title,
        authorName: data.authorName,
        thumbnailImageUrl: data.thumbnailImageUrl,
        thumbnailVideoUrl: data.thumbnailVideoUrl,
        descriptions: data.descriptions ?? null,
        tags: data.tags,
        category: data.category as Blog_Category,
        status: data.status ?? BlogStatus.DRAFT,
        publishedAt: isPublished ? new Date() : null,
        contentImages: {
          create: (data.contentImages || []).map((ci) => ({
            imageUrl: ci.imageUrl,
            imageTitle: ci.imageTitle,
            imageDetail: ci.imageDetail,
            imageDescription: ci.imageDescription ?? '',
          })),
        },
      },
      include: { contentImages: true },
    });
  }

  // =========================
  // UPDATE BLOG
  // =========================
  async update(id: string, data: any) {
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

    return this.prisma.blog.update({
      where: { id },
      data: updateData,
      include: { contentImages: true },
    });
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
      data: items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

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
  async findOne(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { contentImages: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

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
    const image = await this.prisma.blogContentImage.findFirst({
      where: { id: imageId, blogId },
    });
    if (!image) throw new NotFoundException('Content image not found');

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
    });

    await this.blogUpload.deleteMany(images.map((i) => i.imageUrl));
    await this.prisma.blogContentImage.deleteMany({
      where: { id: { in: contentImageIds }, blogId },
    });

    return {
      success: true,
      deletedCount: contentImageIds.length,
    };
  }
}
