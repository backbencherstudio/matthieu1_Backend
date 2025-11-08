import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMainbaseproductDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    benefits?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    leatherCareGuide?: string;

    // Variant operations (optional)
    @IsOptional()
    @IsArray()
    variantsCreate?: Array<{
        colorId?: string;
        sizeId?: string;
        price: number;
        discountPrice?: number;
        stockQuantity: number;
        isDefault?: boolean;
        images?: string[];
    }>;

    // variant updates/deletes are handled by dedicated endpoints
}
