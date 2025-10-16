import { type } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";


export class CreateMaincategoryDto {
    
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEnum(type)
  type: type;
  
}
