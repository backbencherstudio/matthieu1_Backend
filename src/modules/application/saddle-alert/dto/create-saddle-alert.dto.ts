//   cretae dto for this model
import { Color, Discpline } from '@prisma/client';
import { IsString, IsNumber, IsEnum, IsEmail, IsNotEmpty } from 'class-validator';
export class CreateSaddleAlertDto {
    @IsString()
    brand: string;

    @IsEnum(Discpline)
    discpline: Discpline;

    @IsString()
    seatsSize: string;

    @IsEnum(Color)
    color: Color;

    @IsString()
    customerFirstName: string;

    @IsString()
    customerLastName: string;

    @IsEmail()
    customerEmail: string;

    @IsString()
    phoneNumber: string;

    @IsString()
    town: string;

    @IsString()
    state: string;

    @IsString()
    notes: string;

    @IsNumber()
    priceMin: number;

    @IsNumber()
    priceMax: number;
}
