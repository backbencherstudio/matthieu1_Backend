import { PartialType } from '@nestjs/swagger';
import { CreateFirebaseGoogleauthDto } from './create-firebase-googleauth.dto';

export class UpdateFirebaseGoogleauthDto extends PartialType(CreateFirebaseGoogleauthDto) {}
