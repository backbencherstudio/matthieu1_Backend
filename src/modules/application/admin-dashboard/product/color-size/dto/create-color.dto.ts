import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}


