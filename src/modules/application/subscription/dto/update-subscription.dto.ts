import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SubscriptionType } from '@prisma/client';

export class UpdateSubscriptionDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsEnum(SubscriptionType)
  type?: SubscriptionType;

  @IsOptional()
  currentPeriodEnd?: Date;
}