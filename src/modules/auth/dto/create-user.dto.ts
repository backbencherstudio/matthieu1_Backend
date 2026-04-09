// import { ApiProperty } from '@nestjs/swagger';
// import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

// export class CreateUserDto {
//   @IsNotEmpty()
//   @ApiProperty()
//   email: string;

//   @IsNotEmpty()
//   @MinLength(8, { message: 'Password should be minimum 8' })
//   @ApiProperty()
//   password: string;

//   @ApiProperty({
//     type: String,
//     example: 'user',
//   })
//   type?: string;

//   @IsNotEmpty()
//   confirm_password: string;

//   @IsNotEmpty()
//   first_name: string;

//   @IsNotEmpty()
//   last_name: string;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  last_name: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  password: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  confirm_password: string;
}
