import { PartialType } from '@nestjs/mapped-types';
import { CreateUsedSaddleDto } from './create-used-saddle.dto';

export class UpdateUsedSaddleDto extends PartialType(CreateUsedSaddleDto) {}
