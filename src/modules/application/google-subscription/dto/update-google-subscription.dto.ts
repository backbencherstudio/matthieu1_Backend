import { PartialType } from '@nestjs/swagger';
import { CreateGoogleSubscriptionDto } from './create-google-subscription.dto';

export class UpdateGoogleSubscriptionDto extends PartialType(CreateGoogleSubscriptionDto) {}
