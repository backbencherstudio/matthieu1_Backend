import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { FileStorage } from 'src/common/lib/Disk/FileStorage';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import appConfig from 'src/config/app.config';
import { StringHelper } from 'src/common/helper/string.helper';
import { UpdateAdminInfoDto } from './dto/dto/update-admin-info.dto';
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class SystemSettingsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  // Update user's role using email
  async assignRoleByEmail(email: string, name: string, roleType: string) {
    const user = await this.prisma.user.findUnique({
      where: { email, name },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: { type: roleType },
    });

        // Send email if the role is updated to 'admin'
    if (roleType === 'admin') {
      await this.mailService.sendAdminRoleChangedEmail({
        name: updatedUser.first_name ?? updatedUser.name,
        email: updatedUser.email,
      });
    }

    return {
      message: `Role updated to '${roleType}' successfully`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        type: updatedUser.type,
      },
    };
  }

  // List all users with the 'admin' role
  async getAdminList() {
    const admins = await this.prisma.user.findMany({
      where: { type: 'admin' },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
      },
    });

    return {
      success: true,
      data: admins,
    };
  }

  async updateAdminInfo(
    userId: string,
    dto: UpdateAdminInfoDto,
    avatar?: Express.Multer.File,
  ) {
    // Load & verify target user is admin
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    if (user.type !== 'admin') {
      throw new BadRequestException('Target user is not an admin');
    }

    const data: any = {};

    // if (dto.firstName) data.first_name = dto.firstName;
    // if (dto.lastName) data.last_name = dto.lastName;
    if (dto.name) data.name = dto.name;

    if (dto.email && dto.email !== user.email) {
      const exists = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id: userId } },
        select: { id: true },
      });
      if (exists) throw new BadRequestException('Email already in use');
      data.email = dto.email;
    }

    if (avatar) {
      if (user.avatar) {
        await FileStorage.delete(appConfig().storageUrl.avatar + user.avatar);
      }
      const fileName = `${StringHelper.randomString()}_${avatar.originalname}`;
      await FileStorage.put(
        appConfig().storageUrl.avatar + fileName,
        avatar.buffer,
      );
      data.avatar = fileName;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No changes provided');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        type: true,
        updated_at: true,
      },
    });

    return {
      success: true,
      message: 'Admin info updated',
      data: updated,
    };
  }

  // 2) Update admin password
  async updateAdminPassword(
    userId: string,
    body: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    },
  ) {
    const { currentPassword, newPassword, confirmPassword } = body;

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (user.type !== 'admin') {
      throw new BadRequestException('Target user is not an admin');
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new BadRequestException('All password fields are required');
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const isCurrentValid = await bcrypt.compare(
      currentPassword,
      user.password ?? '',
    );
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // fire the email but don't fail the whole request if it errors
  try {
    if (user.email) {

      await this.mailService.sendAdminPasswordChangedEmail({
        name: user.name ?? '',
        email: user.email,
        newPassword,
      });
    }
  } catch {
    // ignore email notification failures
  }

    return {
      success: true,
      message: 'Password updated successfully',
    };
  }
}
