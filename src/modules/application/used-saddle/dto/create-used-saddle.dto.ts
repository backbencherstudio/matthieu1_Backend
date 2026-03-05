// import { IsEnum, IsInt, IsString, Min } from 'class-validator';
// import { TrialPeriod, productcategory } from '@prisma/client';

// export class CreateUsedSaddleDto {
//   @IsString()
//   title: string;

//   @IsString()
//   description: string;

//   @IsString()
//   seatSize: string;

//   @IsEnum(productcategory)
//   category: productcategory;

//   @IsString()
//   usedsaddlecategory: string;

//   @IsInt()
//   @Min(0)
//   basePrice: number;

//   // ✅ THIS WAS MISSING
//   @IsEnum(TrialPeriod)
//   trialPeriod: TrialPeriod;
// }

// import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
// import { productcategory, TrialPeriod } from '@prisma/client';

// export class CreateUsedSaddleDto {
//   @IsString()
//   @IsNotEmpty({ message: 'Title is required' })
//   title: string;

//   @IsString()
//   @IsNotEmpty({ message: 'Description is required' })
//   description: string;

//   @IsString()
//   @IsNotEmpty({ message: 'Seat size is required' })
//   seatSize: string;

//   @IsEnum(productcategory, {
//     message: 'Invalid product category',
//   })
//   category: productcategory;

//   @IsString()
//   @IsNotEmpty({ message: 'Used saddle category is required' })
//   usedsaddlecategory: string;

//   @IsInt({ message: 'Base price must be a number' })
//   @Min(1, { message: 'Base price must be greater than 0' })
//   basePrice: number;

//   @IsEnum(TrialPeriod, {
//     message: 'Trial period must be NO_TRIAL | TRIAL_7_DAYS | TRIAL_14_DAYS',
//   })
//   trialPeriod: TrialPeriod;
// }

import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { productcategory, TrialPeriod } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateUsedSaddleDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsString()
  @IsNotEmpty({ message: 'Seat size is required' })
  seatSize: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  stockQuantity: number;

  @IsEnum(productcategory, {
    message: 'Invalid product category',
  })
  category: productcategory;

  @IsString()
  @IsNotEmpty({ message: 'Used saddle category is required' })
  usedsaddlecategory: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  basePrice_usd: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  basePrice_eur: number;

  // @IsEnum(TrialPeriod, {
  //   message: 'Trial period must be NO_TRIAL | TRIAL_7_DAYS | TRIAL_14_DAYS',
  // })
  // trialPeriod: TrialPeriod;

  @IsOptional()
  images?: any;
}
