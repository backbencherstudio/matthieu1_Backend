// src/contact-info/dto/update-contact-info.dto.ts

import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateContactInfoDto {
    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsUrl()
    fb_link?: string;

    @IsOptional()
    @IsUrl()
    instagram_link?: string;

    @IsOptional()
    @IsUrl()
    tiktok_link?: string;

    @IsOptional()
    @IsUrl()
    youtube_link?: string;
}