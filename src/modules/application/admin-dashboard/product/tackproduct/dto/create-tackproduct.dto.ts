import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { productcategory, saddlecountry, tackSubcategory } from '@prisma/client';

class VariantInputDto {
  @IsOptional()
  @IsString()
  colorId?: string; // Reference to color model

  @IsOptional()
  @IsString()
  sizeId?: string; // Reference to size model

  @IsNotEmpty()
  // @IsNumber()
  price_usd: number;

  @IsNotEmpty()
  // @IsNumber()
  price_eur: number;

  @IsNotEmpty()
  // @IsNumber()
  stockQuantity: number;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsArray()
  images?: string[]; // array of image URLs for the variant
}

export class CreateTackproductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsEnum(productcategory)
  category: productcategory;

  @IsOptional()
  @IsEnum(tackSubcategory)
  subcategory?: tackSubcategory;

  @IsEnum(saddlecountry)
  country: saddlecountry;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  leatherCareGuide?: string;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VariantInputDto)
  @ArrayMinSize(1)
  variants: VariantInputDto[];

  @IsOptional()
  @IsString()
  thumbnailImage?: string;
}
