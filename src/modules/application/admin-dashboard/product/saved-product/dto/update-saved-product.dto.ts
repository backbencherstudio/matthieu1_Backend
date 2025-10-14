import { PartialType } from '@nestjs/swagger';
import { CreateSavedProductDto } from './create-saved-product.dto';

export class UpdateSavedProductDto extends PartialType(CreateSavedProductDto) {}
