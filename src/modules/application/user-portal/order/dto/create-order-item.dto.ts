// src/order/dto/create-order-item.dto.ts
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  @IsOptional()
  tackProductId?: string;

  @IsString()
  @IsOptional()
  variantId?: string;

  @IsString()
  @IsOptional()
  usedSaddleId?: string;

  @IsString()
  @IsOptional()
  leadlineId?: string;

  @IsString()
  itemName: string;

  @IsString()
  @IsOptional()
  itemImage?: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsNumber()
  totalPrice: number;

  @IsString()
  currency: string;
}