import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateContactInfoDto {
  @IsString()
  address: string;

  @IsOptional()
  @IsUrl()
  facebook?: string;

  @IsOptional()
  @IsUrl()
  instagram?: string;

  @IsOptional()
  @IsUrl()
  tiktok?: string;
  
  @IsOptional()
  @IsUrl()
  youtube?: string;
}
