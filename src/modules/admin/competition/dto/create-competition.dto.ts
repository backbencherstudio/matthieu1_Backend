import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompetitionDto {
  @IsNotEmpty() @IsString()
  name: string;

  @IsNotEmpty() @IsString()
  location: string;

  @IsNotEmpty() @IsString()
  date: string; // input: dd/mm/yy

  @IsNotEmpty() @IsString()
  discipline: string;
}
