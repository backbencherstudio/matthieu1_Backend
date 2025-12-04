import { IsOptional, IsString } from "class-validator";

export class CreateTeamDto {
  @IsString()
  name: string;

  @IsString()
  designation?: string;
  
  @IsOptional()
  @IsString()
  image?: string;
}
