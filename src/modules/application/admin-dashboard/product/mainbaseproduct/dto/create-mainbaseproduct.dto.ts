import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class VariantInputDto {
    @IsOptional()
    @IsString()
    color?: string;

    @IsOptional()
    @IsString()
    size?: string;

    @IsNotEmpty()
    // @IsNumber()
    price: number;

    @IsOptional()
    // @IsNumber()
    discountPrice?: number;

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

export class CreateMainbaseproductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    sku?: string;

    @IsString()
    @IsNotEmpty()
    categoryId: string;

    @IsOptional()
    @IsString()
    subcategoryId?: string;

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
}
