import { PartialType } from '@nestjs/mapped-types';
import { CreateTrySaddleDto } from './create-try-saddle.dto';

export class UpdateTrySaddleDto extends PartialType(CreateTrySaddleDto) {}