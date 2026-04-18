import { PartialType } from '@nestjs/swagger';
import { CreateCheckoutAddressDto } from './create-checkout-address.dto';

export class UpdateCheckoutAddressDto extends PartialType(CreateCheckoutAddressDto) {}
