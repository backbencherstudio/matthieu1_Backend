import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateContactDto {
  @ApiProperty()
  name?: string;


  
  @ApiProperty()
  subject: string;

  // @ApiProperty()
  // last_name?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  // @ApiProperty()
  // phone_number?: string;

  @IsNotEmpty()
  @ApiProperty()
  message: string;
}
