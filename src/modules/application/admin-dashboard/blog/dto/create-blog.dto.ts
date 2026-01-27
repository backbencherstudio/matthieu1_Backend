// import {
//   IsArray,
//   IsOptional,
//   IsString,
//   IsUrl,
//   ArrayNotEmpty,
// } from 'class-validator';
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

//   @IsArray()
//   @ArrayNotEmpty()
//   @IsString({ each: true })
//   descriptions: string[];

//   @IsArray()
//   @IsString({ each: true })
//   tags: string[];

//   @IsString()
//   categoryId: string;

//   @IsArray()
//   @Type(() => CreateBlogContentImageDto)
//   contentImages: CreateBlogContentImageDto[];
// }

import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateBlogContentImageDto {
  @IsUrl()
  imageUrl: string;

  @IsString()
  imageTitle: string;

  @IsString()
  imageDetail: string;

  @IsString()
  imageDescription: string;
}

export class CreateBlogDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsUrl()
  thumbnailImageUrl?: string;

  @IsOptional()
  @IsUrl()
  thumbnailVideoUrl?: string;

  @IsArray()
  tags: string[];

  @IsString()
  categoryId: string;

  @IsArray()
  contentImages: CreateBlogContentImageDto[];
}
