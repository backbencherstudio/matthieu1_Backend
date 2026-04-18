// import { IsArray, IsOptional, IsString, IsUrl, ArrayNotEmpty } from 'class-validator';
// import { Type } from 'class-transformer';
<<<<<<< HEAD

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

import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  ArrayNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { BlogCategory, BlogStatus } from '@prisma/client';

export class CreateBlogContentImageDto {
  @IsUrl()
  imageUrl: string;

  @IsString()
  imageTitle: string;

  @IsString()
  imageDetail: string;

  @IsString()
  imagedescription: string;
}
=======

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
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

<<<<<<< HEAD
  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  thumbnailImageUrl?: string;

  @IsOptional()
  @IsUrl()
  thumbnailVideoUrl?: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(BlogCategory)
  category: BlogCategory;
=======
  @IsOptional()
  @IsString()
  descriptions?: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(Blog_Category)
  category: Blog_Category;
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;
<<<<<<< HEAD

  @IsOptional()
  @IsArray()
  @Type(() => CreateBlogContentImageDto)
  contentImages?: CreateBlogContentImageDto[];
=======
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
}
