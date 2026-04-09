// import { IsArray, IsOptional, IsString, IsUrl, ArrayNotEmpty } from 'class-validator';
// import { Type } from 'class-transformer';

// export class CreateBlogContentImageDto {
//   @IsUrl() imageUrl: string;
//   @IsString() imageTitle: string;
//   @IsString() imageDetail: string;
// }

// export class CreateBlogDto {
//   @IsString() title: string;
//   @IsString() authorName: string;

//   @IsOptional() @IsUrl() thumbnailImageUrl?: string;
//   @IsOptional() @IsUrl() thumbnailVideoUrl?: string;

//   @IsArray() @ArrayNotEmpty() @IsString({ each: true })
//   descriptions: string[];

//   @IsArray() @IsString({ each: true })
//   tags: string[];

//   @IsString()
//   categoryId: string;

//   @IsArray() @Type(() => CreateBlogContentImageDto)
//   contentImages: CreateBlogContentImageDto[];
// }

import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Blog_Category, BlogStatus } from '@prisma/client';

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsOptional()
  @IsString()
  descriptions?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(Blog_Category)
  category: Blog_Category;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
}
