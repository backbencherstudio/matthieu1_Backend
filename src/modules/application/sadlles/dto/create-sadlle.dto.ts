import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  productcategory,
  saddlecountry,
  saddleSubcategory,
} from '@prisma/client';

const normalizeArray = ({ value }: { value: any }) => {
  if (value === undefined || value === null) return undefined;
  return Array.isArray(value) ? value : [value];
};

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
  price_usd: string;

  @IsString()
  price_eur: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(saddlecountry)
  country: saddlecountry;

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

  @IsEnum(productcategory)
  category: productcategory;

  @IsOptional()
  @IsEnum(saddleSubcategory)
  subcategory?: saddleSubcategory;

  images?: string[];
}
