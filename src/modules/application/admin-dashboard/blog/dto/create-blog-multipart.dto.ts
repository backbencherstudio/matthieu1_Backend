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


<<<<<<< HEAD
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ArrayNotEmpty,
  ValidateIf,
  IsJSON,
} from 'class-validator';
import { BlogCategory, BlogStatus } from '@prisma/client';
=======
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Blog_Category } from '@prisma/client';
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89

export class CreateBlogMultipartDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

<<<<<<< HEAD
  @IsString()
  description: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  tags: string[];

  @IsEnum(BlogCategory)
  category: BlogCategory;

  @IsOptional()
  @IsEnum(BlogStatus)
  status?: BlogStatus;

  /**
   * JSON string aligned with uploaded contentImages:
   * [
   *   {
   *     "imageTitle": "Intro",
   *     "imageDetail": "First step",
   *     "imageDescription": "Hero image"
   *   }
   * ]
   */
  @IsOptional()
  @IsString()
  @ValidateIf(o => o.contentImagesMeta !== undefined)
  @IsJSON()
  contentImagesMeta?: string;
=======
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
>>>>>>> e990286489baae4568a4d59bf4d4138a61b5aa89
}
