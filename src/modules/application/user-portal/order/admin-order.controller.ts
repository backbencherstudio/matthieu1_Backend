import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Put,
  Body,
} from '@nestjs/common';
import { AdminOrderService } from './admin-order.sevice';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('admin/orders')
export class AdminOrderController {
  constructor(private readonly adminOrderService: AdminOrderService) {}

  /**
   * 📦 Get all orders of all users (admin access)
   */
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply both JwtAuthGuard and RolesGuard
  @Roles(Role.ADMIN) // Allow only admin role to access this route
  async getAllOrders(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
    @Query('search') search?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.adminOrderService.getAllOrders(pageNum, limitNum, search);
  }

  /**
   * 📦 Get single order by ID (admin access)
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply both JwtAuthGuard and RolesGuard
  @Roles(Role.ADMIN) // Allow only admin role to access this route
  async getOrder(@Param('id') id: string) {
    return this.adminOrderService.getOrderById(id);
  }

  /**
   * ✏️ Update order status (admin access)
   */
  @Put(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard) // Apply both JwtAuthGuard and RolesGuard
  @Roles(Role.ADMIN) // Allow only admin role to access this route
  async updateOrderStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.adminOrderService.updateOrderStatus(
      id,
      updateOrderStatusDto.status,
    );
  }
}
