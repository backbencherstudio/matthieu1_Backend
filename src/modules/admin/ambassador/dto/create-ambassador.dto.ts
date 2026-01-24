import { IsOptional, IsString } from "class-validator";

export class CreateAmbassadorDto {
  @IsString()
  name: string;

  @IsString()
  social_links?: string;
  
  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  flag_image?: string;
}
