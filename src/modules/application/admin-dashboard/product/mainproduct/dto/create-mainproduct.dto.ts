
import { Category } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateMainproductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsNotEmpty()
  // @IsNumber()
  stockQuantity: number;

  @IsOptional()
  @IsString()
  benefits?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  leatherCareGuide?: string;

  @IsNotEmpty()
  // @IsNumber()
  price: number;

  @IsOptional()
  // @IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;


  @IsString()
  categoryId: string;

  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @IsOptional()
  @IsArray()
  images?: string[];
}
