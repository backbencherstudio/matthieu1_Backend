import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateSizeDto {
    @IsString()
    @IsNotEmpty()
    name: string;
}

