import { IsOptional, IsString } from "class-validator";

export class CreateAmbassadorDto {
  @IsString()
  name: string;

  @IsString()
  social_links?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
}
