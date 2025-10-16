import { PartialType } from '@nestjs/swagger';
import { CreateMaincategoryDto } from './create-maincategory.dto';

export class UpdateMaincategoryDto extends PartialType(CreateMaincategoryDto) {}
