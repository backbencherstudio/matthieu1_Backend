import { PartialType } from '@nestjs/swagger';
import { CreateSadlleDto } from './create-sadlle.dto';

export class UpdateSadlleDto extends PartialType(CreateSadlleDto) {}
