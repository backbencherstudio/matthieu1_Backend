import { PartialType } from '@nestjs/swagger';
import { CreateMainproductDto } from './create-mainproduct.dto';

export class UpdateMainproductDto extends PartialType(CreateMainproductDto) {}
