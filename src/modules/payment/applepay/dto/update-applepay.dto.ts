import { PartialType } from '@nestjs/swagger';
import { CreateApplepayDto } from './create-applepay.dto';

export class UpdateApplepayDto extends PartialType(CreateApplepayDto) {}
