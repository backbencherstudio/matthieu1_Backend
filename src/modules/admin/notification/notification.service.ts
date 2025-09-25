import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

import { formatDistanceToNow } from 'date-fns';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Fetch notifications for admin (only types: register, payment, subscription)
  async getAdminNotifications(limit: number, offset: number, receiverId: string) {
    try {
      // Fetch notifications for admin, only with specific types
      const notifications = await this.prisma.notification.findMany({
        take: limit,
        skip: offset,
        where: {
          type: {
            in: ['register', 'payment', 'subscription'], // Admin can only see these types
          },

          AND: [
            { receiver_id: receiverId }, // Ensure the specific admin sees only their notifications
          ],
        },
        orderBy: { created_at: 'desc' }, // Sort by creation time (newest first)
        include: {
          sender: { select: { id: true, username: true } }, // Include sender's info (username)
         
        },
      });

       const notificationsWithTimeAgo = notifications.map((notification) => {
        return {
          ...notification,
          timeAgo: formatDistanceToNow(new Date(notification.created_at)) + ' ago',
        };
      });

      // If there are notifications, mark them as read
      if (notifications.length > 0) {
        const notificationIds = notifications.map(
          (notification) => notification.id,
        );
        // Update the status to 'read' for the fetched notifications
        await this.prisma.notification.updateMany({
          where: {
            id: { in: notificationIds },
          },
          data: {
            read: true,
            status: 'read', // Mark as read
          },
        });
      }

      // Get total number of notifications (without pagination)
      const total = await this.prisma.notification.count({
        where: {
          type: {
            in: ['register', 'payment', 'subscription'],
          },

          AND: [
            { receiver_id: receiverId }, // Ensure the specific admin sees only their notifications
          ],
        },
      });

      return { success: true, data: notificationsWithTimeAgo, total };
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw new Error(
        error.message || 'An error occurred while fetching notifications.',
      );
    }
  }
}
