// src/contact-infos/dto/update-contact-info.dto.ts

import { IsString, IsUrl } from 'class-validator';

export class UpdateContactInfoDto {
  @IsString()
  address: string;  // Make address required here

  @IsUrl()
  fb_link?: string;

  @IsUrl()
  instagram_link?: string;

  @IsUrl()
  tiktok_link?: string;

  @IsUrl()
  youtube_link?: string;
}
