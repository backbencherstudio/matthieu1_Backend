
import { Category, ProductName } from '@prisma/client';
import { IsString, IsOptional, IsNumber, IsUUID, IsArray, IsEnum } from 'class-validator';

export class CreateMainproductDto {
  @IsEnum(ProductName)
  name: ProductName;

  @IsString()
  sku: string;

  //@IsNumber()
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

  //@IsNumber()
  price: number;

  @IsOptional()
  //@IsNumber()
  discountPrice?: number;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  size?: string;


  @IsEnum(Category)
category: Category;


  @IsString()
  subcategoryId: string;

  @IsOptional()
  @IsArray()
  images?: string[]; 
}
