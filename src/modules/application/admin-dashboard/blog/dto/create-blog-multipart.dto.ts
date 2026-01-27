// import {
//   IsArray,
//   IsOptional,
//   IsString,
//   ArrayNotEmpty,
//   ValidateIf,
//   IsJSON,
// } from 'class-validator';

// export class CreateBlogMultipartDto {
//   @IsString()
//   title: string;

//   @IsString()
//   authorName: string;

//   @IsString()
//   description: string;

//   @IsString()
//   imageDescription: string;

//   @IsArray()
//   @IsString({ each: true })
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

import { IsOptional, IsString, IsJSON } from 'class-validator';

export class CreateBlogMultipartDto {
  @IsString()
  title: string;

  @IsString()
  authorName: string;

  @IsString()
  description: string; // ✅ single

  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  tags?: string;

  /**
   * [
   *  {
   *    "imageTitle": "",
   *    "imageDetail": "",
   *    "imageDescription": ""
   *  }
   * ]
   */
  @IsOptional()
  @IsJSON()
  contentImagesMeta?: string;
}
