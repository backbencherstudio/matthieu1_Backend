import { PartialType } from '@nestjs/swagger';
import { CreateTpaypalDto } from './create-tpaypal.dto';

export class UpdateTpaypalDto extends PartialType(CreateTpaypalDto) {}
