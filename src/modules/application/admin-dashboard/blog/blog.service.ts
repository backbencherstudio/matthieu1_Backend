// // src/modules/blogs/blogs.service.ts
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { PrismaService } from 'src/prisma/prisma.service';

// @Injectable()
// export class BlogsService {
//   constructor(private prisma: PrismaService) { }

//   // Create a new blog
//   async create(data: any) {
//     const blog = await this.prisma.blog.create({
//       data: {
//         title: data.title,
//         authorName: data.authorName,
//         thumbnailImageUrl: data.thumbnailImageUrl,
//         thumbnailVideoUrl: data.thumbnailVideoUrl,
//         descriptions: data.descriptions,
//         tags: data.tags,
//         categoryId: data.categoryId,
//         contentImages: {
//           create: (data.contentImages || []).map((ci) => ({
//             imageUrl: ci.imageUrl,
//             imageTitle: ci.imageTitle,
//             imageDetail: ci.imageDetail,
//           })),
//         },
//       },
//       include: { category: true, contentImages: true },
//     });
//     return blog;
//   }

//   // Update an existing blog
//   async update(id: string, data: any) {
//     // Ensure the blog exists
//     const blog = await this.prisma.blog.findUnique({ where: { id } });
//     if (!blog) throw new NotFoundException('Blog not found');

//     // Prepare the update data
//     const updateData: any = {
//       title: data.title,
//       authorName: data.authorName,
//       descriptions: data.descriptions,
//       tags: data.tags,
//       categoryId: data.categoryId,
//       thumbnailImageUrl: data.thumbnailImageUrl,
//       thumbnailVideoUrl: data.thumbnailVideoUrl,
//     };

//     // Handle content images if provided
//     if (data.contentImages && Array.isArray(data.contentImages)) {
//       // Separate existing images (with IDs) from new images (without IDs)
//       const existingImages = data.contentImages.filter((img: any) => img.id);
//       const newImages = data.contentImages.filter((img: any) => !img.id);

//       console.log('Updating content images:', { existingImages: existingImages.length, newImages: newImages.length });

//       // Use a shorter transaction with timeout configuration
//       return await this.prisma.$transaction(async (tx) => {
//         // Update the blog basic fields first
//         await tx.blog.update({
//           where: { id },
//           data: updateData,
//         });

//         // Update existing content images in parallel
//         if (existingImages.length > 0) {
//           console.log('Updating existing images:', existingImages);
//           await Promise.all(
//             existingImages.map((img: any) => {
//               console.log('Updating image:', img.id, 'with data:', { imageUrl: img.imageUrl, imageTitle: img.imageTitle, imageDetail: img.imageDetail });
//               return tx.blogContentImage.update({
//                 where: { id: img.id },
//                 data: {
//                   imageUrl: img.imageUrl,
//                   imageTitle: img.imageTitle,
//                   imageDetail: img.imageDetail,
//                 },
//               });
//             })
//           );
//         }

//         // Create new content images in batch
//         if (newImages.length > 0) {
//           console.log('Creating new images:', newImages);
//           await tx.blogContentImage.createMany({
//             data: newImages.map((img: any) => ({
//               blogId: id,
//               imageUrl: img.imageUrl,
//               imageTitle: img.imageTitle,
//               imageDetail: img.imageDetail,
//             })),
//           });
//         }

//         // Return the updated blog with all content images
//         return await tx.blog.findUnique({
//           where: { id },
//           include: { category: true, contentImages: true },
//         });
//       }, {
//         timeout: 10000, // 10 seconds timeout
//       });
//     }

//     // Handle updating the blog (text fields, tags, etc.) without content images
//     const updatedBlog = await this.prisma.blog.update({
//       where: { id },
//       data: updateData,
//       include: { category: true, contentImages: true },
//     });

//     return updatedBlog;
//   }

//   // Get content images of a blog (to handle existing ones)
//   async getContentImages(blogId: string) {
//     const blog = await this.prisma.blog.findUnique({
//       where: { id: blogId },
//       select: { contentImages: true },
//     });
//     return blog?.contentImages || [];
//   }

//   async findAll() {
//     return this.prisma.blog.findMany({
//       include: { category: true, contentImages: true },
//     });
//   }

//   async findOne(id: string) {
//     const blog = await this.prisma.blog.findUnique({
//       where: { id },
//       include: { category: true, contentImages: true },
//     });
//     if (!blog) throw new NotFoundException('Blog not found');
//     return blog;
//   }

//   async remove(id: string) {
//     await this.prisma.blog.delete({ where: { id } });
//     return { message: 'Blog deleted' };
//   }

//   // Update a single content image
//   async updateContentImage(blogId: string, imageId: string, data: { imageTitle?: string; imageDetail?: string; imageUrl?: string }) {
//     // Verify the image belongs to the blog
//     const existingImage = await this.prisma.blogContentImage.findFirst({
//       where: {
//         id: imageId,
//         blogId: blogId,
//       },
//     });

//     if (!existingImage) {
//       throw new NotFoundException('Content image not found');
//     }

//     // Update the content image
//     const updatedImage = await this.prisma.blogContentImage.update({
//       where: { id: imageId },
//       data: {
//         imageTitle: data.imageTitle,
//         imageDetail: data.imageDetail,
//         imageUrl: data.imageUrl,
//       },
//     });

//     return { success: true, data: updatedImage };
//   }

//   // Delete specific content images
//   async deleteContentImages(blogId: string, contentImageIds: string[]) {
//     if (contentImageIds.length === 0) return;

//     await this.prisma.blogContentImage.deleteMany({
//       where: {
//         id: { in: contentImageIds },
//         blogId: blogId,
//       },
//     });

//     return { message: 'Content images deleted' };
//   }
// }


// src/modules/blogs/blogs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) { }

  // Create a new blog
  async create(data: any) {
    const blog = await this.prisma.blog.create({
      data: {
        title: data.title,
        authorName: data.authorName,
        thumbnailImageUrl: data.thumbnailImageUrl,
        thumbnailVideoUrl: data.thumbnailVideoUrl,
        tags: data.tags,
        categoryId: data.categoryId,
        descriptions: {
          create: (data.descriptions || []).map((d: string) => ({
            text: d,
          })),
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

  // Update an existing blog
  async update(id: string, data: any) {
    const blog = await this.prisma.blog.findUnique({ where: { id } });
    if (!blog) throw new NotFoundException('Blog not found');

    const updateData: any = {
      title: data.title,
      authorName: data.authorName,
      tags: data.tags,
      categoryId: data.categoryId,
      thumbnailImageUrl: data.thumbnailImageUrl,
      thumbnailVideoUrl: data.thumbnailVideoUrl,
    };

    // ✅ Handle descriptions
    // if (data.descriptions && Array.isArray(data.descriptions)) {
    //   await this.prisma.blogDescription.deleteMany({ where: { blogId: id } });
    //   updateData.descriptions = {
    //     create: data.descriptions.map((d: string) => ({ text: d })),
    //   };
    // }

    // ✅ Handle content images
    // if (data.contentImages && Array.isArray(data.contentImages)) {
    //   const existingImages = data.contentImages.filter((img: any) => img.id);
    //   const newImages = data.contentImages.filter((img: any) => !img.id);

    //   return await this.prisma.$transaction(
    //     async (tx) => {
    //       await tx.blog.update({
    //         where: { id },
    //         data: updateData,
    //       });

    //       if (existingImages.length > 0) {
    //         await Promise.all(
    //           existingImages.map((img: any) =>
    //             tx.blogContentImage.update({
    //               where: { id: img.id },
    //               data: {
    //                 imageUrl: img.imageUrl,
    //                 imageTitle: img.imageTitle,
    //                 imageDetail: img.imageDetail,
    //               },
    //             }),
    //           ),
    //         );
    //       }

    //       if (newImages.length > 0) {
    //         await tx.blogContentImage.createMany({
    //           data: newImages.map((img: any) => ({
    //             blogId: id,
    //             imageUrl: img.imageUrl,
    //             imageTitle: img.imageTitle,
    //             imageDetail: img.imageDetail,
    //           })),
    //         });
    //       }

    //       return await tx.blog.findUnique({
    //         where: { id },
    //         include: { category: true, contentImages: true, descriptions: true },
    //       });
    //     },
    //     { timeout: 10000 },
    //   );
    // }

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

    return this.prisma.blogContentImage.update({
      where: { id: imageId },
      data,
    });
  }



  async getContentImages(blogId: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
      select: { contentImages: true },
    });
    return blog?.contentImages || [];
  }

  async findAll() {
    return this.prisma.blog.findMany({
      include: { category: true, contentImages: true, descriptions: true },
    });
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

  // async updateContentImage(
  //   blogId: string,
  //   imageId: string,
  //   data: { imageTitle?: string; imageDetail?: string; imageUrl?: string },
  // ) {
  //   const existingImage = await this.prisma.blogContentImage.findFirst({
  //     where: { id: imageId, blogId },
  //   });

  //   if (!existingImage) throw new NotFoundException('Content image not found');

  //   const updatedImage = await this.prisma.blogContentImage.update({
  //     where: { id: imageId },
  //     data: {
  //       imageTitle: data.imageTitle,
  //       imageDetail: data.imageDetail,
  //       imageUrl: data.imageUrl,
  //     },
  //   });

  //   return { success: true, data: updatedImage };
  // }

  async deleteContentImages(blogId: string, contentImageIds: string[]) {
    if (contentImageIds.length === 0) return;

    await this.prisma.blogContentImage.deleteMany({
      where: { id: { in: contentImageIds }, blogId },
    });

    return { message: 'Content images deleted' };
  }
}
