import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  discount: number;

  @IsDateString()
  expiresAt: string;

  @IsOptional()
  @IsNumber()
  maxUsers?: number;

  @IsOptional()
  @IsNumber()
  maxUsesPerUser?: number;
}
