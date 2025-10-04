import { Category } from "@prisma/client";
import { IsEnum } from "class-validator";

export class CreateProductDto {

    @IsEnum(Category)
    category: Category;

}

