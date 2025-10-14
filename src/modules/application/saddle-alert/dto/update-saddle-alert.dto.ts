import { PartialType } from '@nestjs/swagger';
import { CreateSaddleAlertDto } from './create-saddle-alert.dto';

export class UpdateSaddleAlertDto extends PartialType(CreateSaddleAlertDto) {}
