import { IsEnum, IsInt, IsString, Min } from 'class-validator';
import { TrialPeriod, productcategory } from '@prisma/client';

export class CreateUsedSaddleDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  seatSize: string;

  @IsEnum(productcategory)
  category: productcategory;

  @IsString()
  usedsaddlecategory: string;

  @IsInt()
  @Min(0)
  basePrice: number;

  // ✅ THIS WAS MISSING
  @IsEnum(TrialPeriod)
  trialPeriod: TrialPeriod;
}
