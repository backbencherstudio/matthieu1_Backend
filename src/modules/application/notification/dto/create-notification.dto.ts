// src/notification/dto/create-notification.dto.ts
import { NotificationType } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
    @IsOptional()
    @IsString()
    senderId?: string; // Optional, as some notifications might not have a direct sender

    @IsNotEmpty()
    @IsString()
    receiverId: string;

    @IsOptional()
    @IsString()
    entityId?: string; // ID of the related entity (post, friendship, etc.)

    @IsNotEmpty()
    @IsEnum(NotificationType)
    type: NotificationType; // Use the enum type

    @IsNotEmpty()
    @IsString()
    message: string;
}