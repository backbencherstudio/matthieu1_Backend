import { Controller, Patch, Param, UseGuards, HttpException, HttpStatus, Req, UnauthorizedException } from '@nestjs/common';
import { AccountManagementService } from './account-management.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from 'src/common/decorators/user.decorator';

@Controller('account')
export class AccountManagementController {
  constructor(
    private readonly accountManagementService: AccountManagementService,
  ) { }

  @Patch('deactivate/:userId')
  @UseGuards(JwtAuthGuard)
  async deactivateAccount(@Param('userId') userId: string, @User() user: any) {
    const loggedInUserId = user.userId;
    const loggedInUserType = user.type;

    // Admin can deactivate any user account
    if (loggedInUserType === 'admin') {
      try {
        const result = await this.accountManagementService.deactivateAccount(userId);
        return {
          success: true,
          message: result.message || 'Account deactivated successfully',
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to deactivate account',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Normal user can only deactivate their own account
    if (loggedInUserId === userId) {
      try {
        const result = await this.accountManagementService.deactivateAccount(userId);
        return {
          success: true,
          message: result.message || 'Account deactivated successfully',
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to deactivate account',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // If the logged-in user is not an admin and is trying to deactivate someone else's account
    throw new UnauthorizedException('You are not authorized to deactivate this account');
  }

  @Patch('reactivate/:userId')
  @UseGuards(JwtAuthGuard)
  async reactivateAccount(@Param('userId') userId: string, @User() user: any) {
    const loggedInUserId = user.userId;
    const loggedInUserType = user.type;

    // Admin can reactivate any user account
    if (loggedInUserType === 'admin') {
      try {
        const result = await this.accountManagementService.reactivateAccount(userId);
        return {
          success: true,
          message: result.message || 'Account reactivated successfully',
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to reactivate account',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Normal user can only reactivate their own account
    if (loggedInUserId === userId) {
      try {
        const result = await this.accountManagementService.reactivateAccount(userId);
        return {
          success: true,
          message: result.message || 'Account reactivated successfully',
        };
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to reactivate account',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // If the logged-in user is not an admin and is trying to reactivate someone else's account
    throw new UnauthorizedException('You are not authorized to reactivate this account');
  }
}
