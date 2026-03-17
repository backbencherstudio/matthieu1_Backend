import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AddToCartDto {
  @IsOptional()
  @IsString()
  tackProductId?: string;

  @IsOptional()
  @IsString()
  variantId?: string;

  @IsOptional()
  @IsString()
  usedSaddleId?: string;

  @IsOptional()
  @IsString()
  leadlineId?: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  couponCode?: string;
}
