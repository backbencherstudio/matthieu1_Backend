import { IsString, MinLength } from 'class-validator';

export class UpdateAdminPasswordDto {
  @IsString()
  currentPassword: string;

  @IsString() @MinLength(6)
  newPassword: string;
}
