import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsArray,
  IsString,
  Min,
  IsInt,
  IsEnum,
} from 'class-validator';
import { saddleSize,saddlecountry } from '@prisma/client';

const normalizeArray = ({ value }: { value: any }) => {
  if (Array.isArray(value)) return value;
  return [value];
};

export class UpdateSadlleDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  header_title?: string;

  @IsOptional()
  header_description?: string;

  @IsOptional()
  price_usd?: string;

  @IsOptional()
  price_eur?: string;

  // @IsOptional()
  // @IsEnum(saddlecountry)
  // country: saddlecountry;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  stockQuantity?: number;

  // @IsOptional()
  // @IsEnum(saddleSize) // Ensure size is one of the valid enum values
  // size?: saddleSize; // Change type from string to saddleSize enum

  @IsOptional()
  description?: string;

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  colors?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  piping_color?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  leather_type?: string[];

  @IsOptional()
  @Transform(normalizeArray)
  @IsArray()
  images?: string[];
}
