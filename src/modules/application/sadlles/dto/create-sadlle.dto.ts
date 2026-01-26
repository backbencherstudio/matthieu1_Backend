import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { productcategory, saddleSubcategory } from '@prisma/client';

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
  price: string;

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  @IsString({ each: true })
  sizes?: string[];

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

  @IsEnum(productcategory)
  category: productcategory;

  @IsOptional()
  @IsEnum(saddleSubcategory)
  subcategory?: saddleSubcategory;

  images?: string[];
}
