import { IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateCustomerAlertDto {
  @IsString()
  alertId: string;

  @IsString()
  customerName: string;

  @IsEmail()
  customerEmail: string;

  @IsString()
  preferences: string;

  @IsNumber()
  priceMin: number;

  @IsNumber()
  priceMax: number;
}
