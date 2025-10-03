import { Category } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';


export class CreateSubcategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category
}
