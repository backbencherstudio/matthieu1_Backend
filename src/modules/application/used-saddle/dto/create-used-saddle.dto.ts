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

// import {
//   IsEnum,
//   IsInt,
//   IsNotEmpty,
//   IsNumber,
//   IsOptional,
//   IsString,
//   Min,
// } from 'class-validator';
// import { productcategory, saddlecountry } from '@prisma/client';
// import { Type } from 'class-transformer';

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

//   // //discipline is missing in the prisma schema, so we will just use a string for now
//   // @IsString()
//   // @IsNotEmpty({ message: 'Discipline is required' })
//   // discipline: string;

//   @Type(() => Number)
//   @IsInt()
//   @Min(0)
//   stockQuantity: number;

//   @IsEnum(productcategory, {
//     message: 'Invalid product category',
//   })
//   category: productcategory;

//   @IsEnum(saddlecountry)
//   country: saddlecountry;

//   @IsString()
//   @IsNotEmpty({ message: 'Used saddle category is required' })
//   usedsaddlecategory: string;

//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   basePrice_usd: number;

//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   basePrice_eur: number;

//   // @IsEnum(TrialPeriod, {
//   //   message: 'Trial period must be NO_TRIAL | TRIAL_7_DAYS | TRIAL_14_DAYS',
//   // })
//   // trialPeriod: TrialPeriod;

//   @IsOptional()
//   images?: any;
// }

import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Brand,
  Discpline,
  productcategory,
  saddlecountry,
} from '@prisma/client';

export class CreateUsedSaddleDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Description is required' })
  description: string;

  @IsNotEmpty({ message: 'Seat size is required' })
  @IsIn(['16.5', '17', '17.5', '18', '18.5'], {
    message: 'Seat size must be 16.5, 17, 17.5, 18 or 18.5',
  })
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

  @IsEnum(Discpline, {
    message: 'Invalid discipline',
  })
  discipline: Discpline;

  @IsEnum(Brand, {
    message: 'Invalid brand',
  })
  brand: Brand;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  basePrice_usd: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  basePrice_eur: number;

  @IsEnum(saddlecountry, {
    message: 'Invalid saddle country',
  })
  country: saddlecountry;

  @IsOptional()
  images?: any;
}
