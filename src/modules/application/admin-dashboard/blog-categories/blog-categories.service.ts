import { Injectable } from '@nestjs/common';
import { CreateBlogCategoryDto } from './dto/create-blog-category.dto';
import { UpdateBlogCategoryDto } from './dto/update-blog-category.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogCategoriesService {
  constructor(private prisma: PrismaService) { }
  //crete blog category
  async create(createBlogCategoryDto: CreateBlogCategoryDto) {
    try {
      const blogCategory = await this.prisma.blogCategory.create({
        data: createBlogCategoryDto,
      });
      return {
        success: true,
        data: blogCategory,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async findAll() {
    try {
      const blogCategories = await this.prisma.blogCategory.findMany({
        include: { blogs: true },
      });
      return {
        success: true,
        data: blogCategories,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async update(id: string, updateBlogCategoryDto: UpdateBlogCategoryDto) {
    try {
      const blogCategory = await this.prisma.blogCategory.update({
        where: { id },
        data: updateBlogCategoryDto,
      });
      return {
        success: true,
        data: blogCategory,
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
      await this.prisma.blogCategory.delete({
        where: { id },
      });
      return {
        success: true,
        message: 'Blog category deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
