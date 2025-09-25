import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import slugify from 'slugify';

@Injectable()
export class BlogService {
  constructor(private prisma: PrismaService) { }

  async create(createBlogDto: CreateBlogDto, authorId: string) {
    try {
      const slug = slugify(createBlogDto.title, { lower: true });

      const blog = await this.prisma.blog.create({
        data: {
          ...createBlogDto,
          slug,
          authorId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        data: blog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll({
    q = null,
    status = null,
    page = 1,
    limit = 10,
  }: {
    q?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      const skip = (page - 1) * limit;
      const where: any = {};

      if (q) {
        where['OR'] = [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ];
      }

      if (status) {
        where.status = status;
      }

      const [blogs, total] = await Promise.all([
        this.prisma.blog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        }),
        this.prisma.blog.count({ where }),
      ]);

      return {
        success: true,
        data: blogs,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findOne(id: string) {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!blog) {
        return {
          success: false,
          message: 'Blog not found',
        };
      }

      // Increment views
      await this.prisma.blog.update({
        where: { id },
        data: { views: blog.views + 1 },
      });

      return {
        success: true,
        data: blog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findBySlug(slug: string) {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { slug },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!blog) {
        return {
          success: false,
          message: 'Blog not found',
        };
      }

      // Increment views
      await this.prisma.blog.update({
        where: { id: blog.id },
        data: { views: blog.views + 1 },
      });

      return {
        success: true,
        data: blog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    try {
      const blog = await this.prisma.blog.update({
        where: { id },
        data: {
          ...updateBlogDto,
          ...(updateBlogDto.title && {
            slug: slugify(updateBlogDto.title, { lower: true }),
          }),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        data: blog,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.blog.delete({
        where: { id },
      });

      return {
        success: true,
        message: 'Blog deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
