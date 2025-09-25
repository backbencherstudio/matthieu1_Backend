import { PartialType } from '@nestjs/swagger';
import { CreateSystemSetingDto } from './create-system-seting.dto';

export class UpdateSystemSetingDto extends PartialType(CreateSystemSetingDto) {}
