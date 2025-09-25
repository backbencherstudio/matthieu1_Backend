import { Controller, Get, Body, Patch, Param, UseGuards, UseInterceptors, UploadedFile, Put } from '@nestjs/common';
import { Role } from 'src/common/guard/role/role.enum';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { SystemSettingsService } from './system-setings.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UpdateAdminInfoDto } from './dto/dto/update-admin-info.dto';



@Controller('system-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN) // Only admins can access these routes
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) { }

  // Assign role (admin/user) to user by email and name
  @Patch('update-role')
  async assignRole(@Body() body: { email: string; name: string; roleType: string }) {
    return this.systemSettingsService.assignRoleByEmail(body.email, body.name, body.roleType);
  }

  // Get list of all users with 'admin' role
  @Get('admin-list')
  async getAdminList() {
    return this.systemSettingsService.getAdminList();
  }

  @Patch('adminsinfo/:userId')
  @UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
  async updateAdminInfo(
    @Param('userId') userId: string,
    @Body() dto: UpdateAdminInfoDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.systemSettingsService.updateAdminInfo(userId, dto, avatar);
  }

  @Patch('adminspassword/:userId')
  async updateAdminPassword(
    @Param('userId') userId: string,
    @Body() body: { currentPassword: string; newPassword: string; confirmPassword: string }
  ) {
    return this.systemSettingsService.updateAdminPassword(userId, body);
  }
}

