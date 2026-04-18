import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {}

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  order_id: string;
}
