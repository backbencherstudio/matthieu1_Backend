import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationType } from '@prisma/client';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationGateway: NotificationGateway,
  ) { }

  // Create a new notification
  async createNotification({
    receiver_id,
    sender_id,
    message,
    type,
    post_id,
   
  }: {
    receiver_id: string;
    sender_id: string;
    message: string;
    type: NotificationType;
    post_id: string | null;
  }) {


    const notification = await this.prisma.notification.create({
      data: {
        receiver_id,
        sender_id,
        message,
        type,
        post_id,
      },
    });
    this.notificationGateway.notifyUser(receiver_id, message);



    return notification;
  }
}
