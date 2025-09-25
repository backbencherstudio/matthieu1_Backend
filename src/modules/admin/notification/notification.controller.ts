import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express'; // Ensure you import Request from express
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { NotificationService } from './notification.service';

@ApiBearerAuth()
@ApiTags('Notification')
@UseGuards(JwtAuthGuard, RolesGuard) // Protect routes with both JWT and Role Guard
@Roles(Role.ADMIN) // Allow only admin users to access this route
@Controller('admin/notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) { }

  @ApiOperation({ summary: 'Get all notifications for admin (register, payment, subscription only)' })
  @Get()
  async getAdminNotifications(
    @Req() req: Request, // Get user ID from JWT token
    @Query('page') page: number = 1, // Page number (defaults to 1)
    @Query('limit') limit: number = 10, // Limit number of results per page (defaults to 10)
  ) {
    const receiverId = req.user.userId; // Extract user ID from JWT token

    try {
      // Calculate offset for pagination (skip parameter)
      const offset = (page - 1) * limit;

      // Fetch notifications for admin (only types: register, payment, subscription)
      const notifications = await this.notificationService.getAdminNotifications(limit, offset, receiverId);

      return {
        success: true,
        message: 'Notifications retrieved successfully',
        data: notifications.data, // Notifications data
        total: notifications.total, // Total number of notifications
        page, // Current page number
        limit, // Results per page
      };
    } catch (error) {
      console.error('Error:', error);
      return {
        success: false,
        message: 'An error occurred while fetching notifications.',
      };
    }
  }
}

