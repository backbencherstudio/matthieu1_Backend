// src/notification/dto/update-notification.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationDto } from './create-notification.dto';
import { IsOptional, IsDateString, IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  // Add the 'id' property explicitly, as it's required for updates
  @IsNotEmpty() // The ID should not be empty when updating
  @IsString()
  id: string;

  @IsOptional()
  @IsDateString()
  readAt?: Date; // To mark notification as read

  @IsOptional()
  @IsNumber()
  status?: number; // E.g., 0 for unread, 1 for read (matching your SmallInt status)
}