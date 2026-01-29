// import { IsArray, IsOptional, IsString, ArrayNotEmpty, ValidateIf, IsJSON } from 'class-validator';

// export class CreateBlogMultipartDto {
//   @IsString() title: string;
//   @IsString() authorName: string;

//   @IsArray() @ArrayNotEmpty() @IsString({ each: true })
//   descriptions: string[];

//   @IsArray() @IsString({ each: true })
//   tags: string[];

//   @IsString() categoryId: string;

//   /**
//    * JSON string array aligned with uploaded contentImages:
//    * [
//    *   {"imageTitle":"Intro","imageDetail":"First step"},
//    *   {"imageTitle":"Step2","imageDetail":"Second step"}
//    * ]
//    */
//   @IsOptional()
//   @IsString()
//   @ValidateIf((o) => o.contentImagesMeta !== undefined)
//   @IsJSON()
//   contentImagesMeta?: string;
// }


import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Blog_Category } from '@prisma/client';

export class CreateBlogMultipartDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsOptional()
  @IsString()
  descriptions?: string;

  @IsString()
  tags: string; // comma separated

  @IsEnum(Blog_Category)
  category: Blog_Category;

  @IsOptional()
  @IsString()
  contentImagesMeta?: string; // JSON
}
