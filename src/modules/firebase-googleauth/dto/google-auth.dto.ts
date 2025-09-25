import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class GoogleAuthDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'GOOGLE_ID_TOKEN_HERE', required: false })
  idToken?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'John Doe', required: false })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'user@example.com', required: false })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'https://example.com/profile.jpg', required: false })
  profilePicUrl?: string;
}
