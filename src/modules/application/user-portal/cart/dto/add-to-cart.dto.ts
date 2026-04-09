import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum TrialPeriodEnum {
  NO_TRIAL = 'NO_TRIAL',
  TRIAL_7_DAYS = 'TRIAL_7_DAYS',
  TRIAL_14_DAYS = 'TRIAL_14_DAYS',
}

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

  @IsOptional()
  @IsEnum(TrialPeriodEnum, {
    message: 'trialPeriod must be NO_TRIAL, TRIAL_7_DAYS or TRIAL_14_DAYS',
  })
  trialPeriod?: TrialPeriodEnum;
}
