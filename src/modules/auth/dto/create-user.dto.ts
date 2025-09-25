import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {


  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @IsNotEmpty()
  @MinLength(8, { message: 'Password should be minimum 8' })
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name: string;

  @ApiProperty({
    type: String,
    example: 'user',
  })
  type?: string;

  // Add these new fields for social logins
  @IsOptional()
  @IsString()
  facebook_id?: string;

  @IsOptional()
  @IsString()
  google_id?: string;

  @IsOptional()
  @IsString()
  avatar?: string; // If you want to store the social profile picture directly
}
