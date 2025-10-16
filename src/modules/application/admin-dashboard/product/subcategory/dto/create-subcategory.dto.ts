import { Category } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';


export class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  categoryId: string;
}
