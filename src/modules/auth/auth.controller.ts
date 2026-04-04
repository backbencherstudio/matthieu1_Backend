import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import { memoryStorage } from 'multer';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { Roles } from 'src/common/guard/role/roles.decorator';
import { Role } from 'src/common/guard/role/role.enum';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Get user details' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    try {
      const user_id = req.user.userId;

      const response = await this.authService.me(user_id);

      return response;
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch user details',
      };
    }
  }

  @ApiOperation({ summary: 'Register a user' })
  @Post('register')
  async create(@Body() data: CreateUserDto) {
    try {
      const { email, password } = data;

      if (!email) {
        return {
          success: false,
          statusCode: 400,
          message: 'Email not provided',
        };
      }

      if (!password) {
        return {
          success: false,
          statusCode: 400,
          message: 'Password not provided',
        };
      }

      const response = await this.authService.register({ email, password });

      return response; // Return the unified response
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error?.message || 'Something went wrong',
      };
    }
  }

  @ApiOperation({ summary: 'Get all users (type: user)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('users')
  // async getAllUsers() {
  //   try {
  //     return await this.authService.getAllUsers();
  //   } catch (error) {
  //     return {
  //       success: false,
  //       statusCode: 500,
  //       message: error?.message || 'Something went wrong',
  //     };
  //   }
  // }
  async getUsers(@Query('page') page = '1', @Query('limit') limit = '10') {
    try {
      return await this.authService.getUsersWithPagination(
        Number(page),
        Number(limit),
      );
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error?.message || 'Something went wrong',
      };
    }
  }

  // login user
  @ApiOperation({ summary: 'Login user' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request) {
    try {
      const user_id = req.user.id;

      const user_email = req.user.email;

      const response = await this.authService.login(
        {
          userId: user_id,
          email: user_email,
        },
        req,
      );

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Login user with two Factor OTP' })
  //@UseGuards(LocalAuthGuard)
  @Post('twofactor')
  async loginWithOtp(
    @Body('user_id') user_id: String,
    @Body('otp') otp: Number,
  ) {
    try {
      console.log('lalala');
      const response = await this.authService.verifyOtpTwoFactor({
        userId: user_id,
        otp,
      });

      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @ApiOperation({ summary: 'Update user address and phone' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('update-address')
  async updateUserAddress(
    @Req() req: Request,
    @Body()
    data: {
      phone_number?: string;
      address?: string;
    },
  ) {
    try {
      const user_id = req.user.userId;

      return await this.authService.updateUserAddress(user_id, data);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update contact information',
      };
    }
  }

  @ApiOperation({ summary: 'Get user contact information' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('contact-info')
  async getUserAddress(@Req() req: Request) {
    try {
      const user_id = req.user.userId;

      return await this.authService.getUserAddress(user_id);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch contact information',
      };
    }
  }

  // --------------change password---------

  @ApiOperation({ summary: 'Forgot password' })
  @Post('forgot-password')
  async forgotPassword(@Body() data: { email: string }) {
    try {
      const email: string = data.email;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.forgotPassword(email);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // verify email to verify the email
  @ApiOperation({ summary: 'Verify email' })
  @Post('verify-email')
  async verifyEmail(@Body() data: VerifyEmailDto) {
    try {
      const email = data.email;
      const token = data.token;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }

      // ✅ Decode token (without verification)
      const decoded: any = jwt.decode(String(token));
      console.log('Decoded JWT payload:', decoded);

      return await this.authService.verifyEmail({
        email: email,
        token: token,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Failed to verify email',
      };
    }
  }

  // resend verification email to verify the email
  @ApiOperation({ summary: 'Resend verification email' })
  @Post('resend-verification-email')
  async resendVerificationEmail(@Body() data: { email: string }) {
    try {
      const email = data.email;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.resendVerificationEmail(email);
    } catch (error) {
      return {
        success: false,
        message: 'Failed to resend verification email',
      };
    }
  }

  // reset password if user forget the password
  @ApiOperation({ summary: 'Reset password' })
  @Post('reset-password')
  async resetPassword(
    @Body() data: { email: string; token: string; password: string },
  ) {
    try {
      const email = data.email;
      const token = data.token;
      const password = data.password;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!password) {
        throw new HttpException(
          'Password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.authService.resetPassword({
        email: email,
        token: token,
        password: password,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  // change password if user want to change the password
  // @ApiOperation({ summary: 'Change password' })
  // @ApiBearerAuth()
  // @UseGuards(JwtAuthGuard)
  // @Post('change-password')
  // async changePassword(
  //   @Req() req: Request,
  //   @Body() data: { old_password: string; new_password: string },
  // ) {
  //   try {
  //     const user_id = req.user.userId;

  //     const oldPassword = data.old_password;
  //     const newPassword = data.new_password;
  //     if (!oldPassword) {
  //       throw new HttpException(
  //         'Old password not provided',
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     if (!newPassword) {
  //       throw new HttpException(
  //         'New password not provided',
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     return await this.authService.changePassword({
  //       user_id: user_id,
  //       oldPassword: oldPassword,
  //       newPassword: newPassword,
  //     });
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: 'Failed to change password',
  //     };
  //   }
  // }

  @ApiOperation({ summary: 'Change password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Req() req: Request,
    @Body()
    data: {
      old_password: string;
      new_password: string;
      confirm_password: string;
    },
  ) {
    try {
      const user_id = req.user.userId;

      if (!data.old_password) {
        throw new HttpException(
          'Old password not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!data.new_password) {
        throw new HttpException(
          'New password not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (!data.confirm_password) {
        throw new HttpException(
          'Confirm password not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (data.new_password !== data.confirm_password) {
        throw new HttpException(
          'New password and confirm password do not match',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.authService.changePassword({
        user_id,
        oldPassword: data.old_password,
        newPassword: data.new_password,
      });
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // --------------end change password---------

  // -------change email address------
  @ApiOperation({ summary: 'request email change' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('request-email-change')
  async requestEmailChange(
    @Req() req: Request,
    @Body() data: { email: string },
  ) {
    try {
      const user_id = req.user.userId;
      const email = data.email;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.requestEmailChange(user_id, email);
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }

  @ApiOperation({ summary: 'Change user password' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-userpassword')
  async changeUserPassword(
    @Req() req: Request,
    @Body() data: { old_password: string; new_password: string },
  ) {
    try {
      const user_id = req.user.userId;
      const oldPassword = data.old_password;
      const newPassword = data.new_password;
      if (!oldPassword) {
        throw new HttpException(
          'Old password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      if (!newPassword) {
        throw new HttpException(
          'New password not provided',
          HttpStatus.UNAUTHORIZED,
        );
      }
      return await this.authService.changePasswordForUser(
        user_id,
        oldPassword,
        newPassword,
      );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to change password',
      };
    }
  }

  @ApiOperation({ summary: 'Change email address' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('change-email')
  async changeEmail(
    @Req() req: Request,
    @Body() data: { email: string; token: string },
  ) {
    try {
      const user_id = req.user.userId;
      const email = data.email;

      const token = data.token;
      if (!email) {
        throw new HttpException('Email not provided', HttpStatus.UNAUTHORIZED);
      }
      if (!token) {
        throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
      }
      return await this.authService.changeEmail({
        user_id: user_id,
        new_email: email,
        token: token,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Something went wrong',
      };
    }
  }
  // -------end change email address------

  // Tohidul 2FA ------------------------------------------------------------
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/request')
  async send2FA(
    @Req() req: Request,
    @Body('method') method: 'email' | 'phone',
  ) {
    return this.authService.send2FACode(req.user.userId, method);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verify2FAA(@Req() req: Request, @Body('code') code: string) {
    return this.authService.verify2FACode(req.user.userId, code);
  }

  //apple Oauth
}
