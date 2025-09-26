import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  // ---------- Admin ----------
  async create(dto: CreateBlogDto) {
    this.assertSingleThumbnail(dto.thumbnailImageUrl, dto.thumbnailVideoUrl);

    const category = await this.prisma.blogCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) throw new BadRequestException('Invalid categoryId');

    const blog = await this.prisma.blog.create({
      data: {
        title: dto.title,
        authorName: dto.authorName,
        thumbnailImageUrl: dto.thumbnailImageUrl,
        thumbnailVideoUrl: dto.thumbnailVideoUrl,
        descriptions: dto.descriptions,
        tags: dto.tags ?? [],
        categoryId: dto.categoryId,
        contentImages: {
          create: (dto.contentImages ?? []).map(ci => ({
            imageUrl: ci.imageUrl,
            imageTitle: ci.imageTitle,
            imageDetail: ci.imageDetail,
          })),
        },
      },
      include: { category: true, contentImages: true },
    });

    return { success: true, data: blog };
  }

  async findAllAdmin() {
    const blogs = await this.prisma.blog.findMany({
      orderBy: { created_at: 'desc' },
      include: { category: true, contentImages: true },
    });
    return { success: true, data: blogs };
  }

  async findOneAdmin(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { category: true, contentImages: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return { success: true, data: blog };
  }

  async update(id: string, dto: UpdateBlogDto) {
    if (dto.thumbnailImageUrl || dto.thumbnailVideoUrl) {
      this.assertSingleThumbnail(dto.thumbnailImageUrl, dto.thumbnailVideoUrl);
    }

    if (dto.categoryId) {
      const exists = await this.prisma.blogCategory.findUnique({ where: { id: dto.categoryId } });
      if (!exists) throw new BadRequestException('Invalid categoryId');
    }

    const tx: any[] = [];
    if (dto.contentImages) {
      tx.push(this.prisma.blogContentImage.deleteMany({ where: { blogId: id } }));
    }

    tx.push(
      this.prisma.blog.update({
        where: { id },
        data: {
          title: dto.title,
          authorName: dto.authorName,
          thumbnailImageUrl: dto.thumbnailImageUrl,
          thumbnailVideoUrl: dto.thumbnailVideoUrl,
          descriptions: dto.descriptions,
          tags: dto.tags,
          categoryId: dto.categoryId,
          ...(dto.contentImages
            ? {
                contentImages: {
                  create: dto.contentImages.map(ci => ({
                    imageUrl: ci.imageUrl,
                    imageTitle: ci.imageTitle,
                    imageDetail: ci.imageDetail,
                  })),
                },
              }
            : {}),
        },
        include: { category: true, contentImages: true },
      })
    );

    const res = await this.prisma.$transaction(tx);
    const updated = res[res.length - 1];
    return { success: true, data: updated };
  }

  async remove(id: string) {
    await this.prisma.blog.delete({ where: { id } });
    return { success: true, message: 'Blog deleted' };
  }

  // ---------- User ----------
  async findAllUser() {
    const blogs = await this.prisma.blog.findMany({
      orderBy: { created_at: 'desc' },
      include: { category: true, contentImages: true },
    });
    return { success: true, data: blogs };
  }

  async findOneUser(id: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: { category: true, contentImages: true },
    });
    if (!blog) throw new NotFoundException('Blog not found');
    return { success: true, data: blog };
  }

  // helper
  private assertSingleThumbnail(img?: string, vid?: string) {
    if (img && vid) {
      throw new BadRequestException('Provide either thumbnailImageUrl OR thumbnailVideoUrl, not both.');
    }
  }
}
