import { Category } from "@prisma/client";
import { IsEnum, IsString } from "class-validator";

export class CreateProductDto {

    @IsString()
    category: string;

}

