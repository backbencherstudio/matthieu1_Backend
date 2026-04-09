import { IsString, IsNotEmpty, IsEnum, IsEmail, IsPhoneNumber } from 'class-validator';
import { try_saddle_discipline } from '@prisma/client';

export class CreateTrySaddleDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

//   @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  country: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zip_code: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsEnum(try_saddle_discipline)
  @IsNotEmpty()
  discipline: try_saddle_discipline;
}