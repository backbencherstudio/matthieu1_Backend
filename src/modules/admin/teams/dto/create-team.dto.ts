import { IsOptional, IsString } from "class-validator";

export class CreateTeamDto {
    @IsString()
  name: string;
  designation?: string;
  @IsOptional()
  @IsString()
  image?: string;
}
