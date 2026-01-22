// import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
// import { productcategory, saddleSubcategory } from '@prisma/client';

// export class CreateSadlleDto {
//   @IsString()
//   name: string;

//   @IsOptional()
//   @IsString()
//   sku?: string;

//   @IsOptional()
//   @IsString()
//   header_title?: string;

//   @IsOptional()
//   @IsString()
//   header_description?: string;

//   @IsString()
//   price: string;

//   @IsOptional()
//   @IsString()
//   description?: string;

//   @IsOptional()
//   @IsString()
//   colors?: string;

//   @IsOptional()
//   @IsString()
//   piping_color?: string;

//   @IsOptional()
//   @IsString()
//   leather_type?: string;

//   // optional input, but FORCED to SADDLES
//   @IsOptional()
//   @IsEnum(productcategory)
//   category?: productcategory;

//   @IsEnum(saddleSubcategory)
//   subcategory: saddleSubcategory;
// }

import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { productcategory, saddleSubcategory } from '@prisma/client';

export class CreateSadlleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  header_title?: string;

  @IsOptional()
  @IsString()
  header_description?: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  description?: string;

  // 🔥 ARRAYS
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  colors?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  piping_color?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Type(() => String)
  leather_type?: string[];

  @IsOptional()
  @IsEnum(productcategory)
  category?: productcategory;

  @IsEnum(saddleSubcategory)
  subcategory: saddleSubcategory;
}
