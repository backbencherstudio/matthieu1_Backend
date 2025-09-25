
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateAdminInfoDto {
  @IsOptional() @IsEmail()
  email?: string;

  @IsOptional() @IsString()
  name?: string;
}
