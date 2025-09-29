
import { IsString, IsOptional, IsNumber, IsUUID, IsArray } from 'class-validator';

export class CreateMainproductDto {
  @IsString()
  name: string;

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

  @IsString()
  categoryId: string;

  @IsString()
  subcategoryId: string;

  @IsOptional()
  @IsArray()
  images?: string[]; 
}
