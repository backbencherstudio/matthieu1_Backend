import { PartialType } from '@nestjs/swagger';
import { CreateCustomerAlertDto } from './create-customer-alert.dto';

export class UpdateCustomerAlertDto extends PartialType(CreateCustomerAlertDto) {}
