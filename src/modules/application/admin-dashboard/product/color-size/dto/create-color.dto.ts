import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateColorDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(['black', 'brown', 'Black', 'Brown', 'BLACK', 'BROWN'], {
        message: 'Color must be either "black" or "brown"'
    })
    name: string;
}


