// external imports
import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
//internal imports
import appConfig from '../../config/app.config';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRepository } from '../../common/repository/user/user.repository';
import { MailService } from '../../mail/mail.service';
import { UcodeRepository } from '../../common/repository/ucode/ucode.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileStorage } from '../../common/lib/Disk/FileStorage';
import { StripePayment } from '../../common/lib/Payment/stripe/StripePayment';
import { StringHelper } from '../../common/helper/string.helper';
import { addMinutes } from 'date-fns';
import { NotificationService } from '../application/notification/notification.service';
import { AccountManagementService } from './account-management/account-management.service';
import { SubscriptionService } from '../application/subscription/subscription.service';
import { NotificationGateway } from '../application/notification/notification.gateway';
import { StringValue } from 'ms';
import * as geoip from 'geoip-lite';
// import { CartService } from '../application/user-portal/cart/cart.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
    // private readonly cartService: CartService,
    private readonly notificationService: NotificationService,
    private readonly subscriptionService: SubscriptionService,
    private readonly accountManagementService: AccountManagementService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async me(userId: string) {
    try {
      const valid =
        await this.subscriptionService.checkAlreadySubscription(userId);

      if (!valid) {
        await this.prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            subscription_status: 'inactive',
            subscription_type: 'FREE',
            subscripton_end_date: null,
          },
        });
      }
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          id: true,
          name: true,
          bio: true,
          email: true,
          username: true,
          city: true,
          avatar: true,
          coverPhoto: true,
          address: true,
          phone_number: true,
          type: true,
          isPrivate: true,
          gender: true,
          subscription_type: true,
          date_of_birth: true,
          created_at: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      if (user.avatar) {
        user['avatar_url'] = FileStorage.url(
          appConfig().storageUrl.avatar + user.avatar,
        );
      }

      if (user) {
        return {
          success: true,
          data: user,
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async getUserAddress(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          phone_number: true,
          address: true,
        },
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      return {
        success: true,
        message: 'Contact information fetched successfully',
        data: user,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // async updateUser(
  //   userId: string,
  //   updateUserDto: UpdateUserDto,
  //   image?: Express.Multer.File,
  //   coverPhoto?: Express.Multer.File,
  // ) {
  //   try {
  //     const data: any = {};
  //     if (updateUserDto.name) {
  //       data.name = updateUserDto.name;
  //     }
  //     if (updateUserDto.phone_number) {
  //       data.phone_number = updateUserDto.phone_number;
  //     }
  //     if (updateUserDto.country) {
  //       data.country = updateUserDto.country;
  //     }
  //     if (updateUserDto.state) {
  //       data.state = updateUserDto.state;
  //     }
  //     if (updateUserDto.local_government) {
  //       data.local_government = updateUserDto.local_government;
  //     }
  //     if (updateUserDto.city) {
  //       data.city = updateUserDto.city;
  //     }
  //     if (updateUserDto.bio) {
  //       data.bio = updateUserDto.bio;
  //     }
  //     if (updateUserDto.username) {
  //       data.username = updateUserDto.username;
  //     }
  //     if (updateUserDto.zip_code) {
  //       data.zip_code = updateUserDto.zip_code;
  //     }
  //     if (updateUserDto.address) {
  //       data.address = updateUserDto.address;
  //     }
  //     if (updateUserDto.gender) {
  //       data.gender = updateUserDto.gender;
  //     }
  //     if (updateUserDto.date_of_birth) {
  //       data.date_of_birth = DateHelper.format(updateUserDto.date_of_birth);
  //     }
  //     if (image) {
  //       const oldImage = await this.prisma.user.findFirst({
  //         where: { id: userId },
  //         select: { avatar: true },
  //       });
  //       if (oldImage.avatar) {
  //         await FileStorage.delete(
  //           appConfig().storageUrl.avatar + oldImage.avatar,
  //         );
  //       }

  //       const fileName = `${StringHelper.randomString()}${image.originalname}`;
  //       await FileStorage.put(
  //         appConfig().storageUrl.avatar + fileName,
  //         image.buffer,
  //       );

  //       data.avatar = fileName;
  //     }

  //     if (coverPhoto) {
  //       const oldImage = await this.prisma.user.findFirst({
  //         where: { id: userId },
  //         select: { coverPhoto: true },
  //       });
  //       if (oldImage.coverPhoto) {
  //         await FileStorage.delete(
  //           appConfig().storageUrl.avatar + oldImage.coverPhoto,
  //         );
  //       }

  //       // upload file
  //       const fileName = `${StringHelper.randomString()}${image.originalname}`;
  //       await FileStorage.put(
  //         appConfig().storageUrl.avatar + fileName,
  //         coverPhoto.buffer,
  //       );

  //       data.coverPhoto = fileName;
  //     }
  //     const user = await UserRepository.getUserDetails(userId);
  //     if (user) {
  //       await this.prisma.user.update({
  //         where: { id: userId },
  //         data: {
  //           ...data,
  //         },
  //       });
  //       //console.log(user);

  //       return {
  //         success: true,
  //         message: 'User updated successfully',
  //       };
  //     } else {
  //       return {
  //         success: false,
  //         message: 'User not found',
  //       };
  //     }
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  async updateUser(
    userId: string,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    try {
      const data: any = {};

      if (updateUserDto.first_name) {
        data.first_name = updateUserDto.first_name;
      }

      if (updateUserDto.last_name) {
        data.last_name = updateUserDto.last_name;
      }

      if (updateUserDto.email) {
        data.email = updateUserDto.email;
      }

      if (updateUserDto.phone_number) {
        data.phone_number = updateUserDto.phone_number;
      }

      // Image Upload
      if (image) {
        const oldImage = await this.prisma.user.findFirst({
          where: { id: userId },
          select: { avatar: true },
        });

        if (oldImage?.avatar) {
          await FileStorage.delete(
            appConfig().storageUrl.avatar + oldImage.avatar,
          );
        }

        const fileName = `${StringHelper.randomString()}${image.originalname}`;

        await FileStorage.put(
          appConfig().storageUrl.avatar + fileName,
          image.buffer,
        );

        data.avatar = fileName;
      }

      const user = await UserRepository.getUserDetails(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...data,
          ...((data.first_name || data.last_name) && {
            name: `${data.first_name && user.first_name} ${data.last_name && user.last_name}`,
          }),
        },
      });

      return {
        success: true,
        message: 'User updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async updateUserAddress(
    userId: string,
    data: {
      phone_number?: string;
      // country?: string;
      // state?: string;
      // city?: string;
      address?: string;
      // zip_code?: string;
    },
  ) {
    try {
      const user = await UserRepository.getUserDetails(userId);

      if (!user) {
        return {
          success: false,
          message: 'User not found',
        };
      }

      const updateData: any = {};

      if (data.phone_number) updateData.phone_number = data.phone_number;
      if (data.address) updateData.address = data.address;

      await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      return {
        success: true,
        message: 'Address information updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async validateUser(
    email: string,
    pass: string,
    token?: string,
  ): Promise<any> {
    const _password = pass;
    const user = await this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user) {
      const _isValidPassword = await UserRepository.validatePassword({
        email: email,
        password: _password,
      });
      if (_isValidPassword) {
        const { password, ...result } = user;
        if (user.is_two_factor_enabled) {
          if (token) {
            const isValid = await UserRepository.verify2FA(user.id, token);
            if (!isValid) {
              throw new UnauthorizedException('Invalid token');
            }
          } else {
            throw new UnauthorizedException('Token is required');
          }
        }
        return result;
      } else {
        throw new UnauthorizedException('Password not matched');
      }
    } else {
      throw new UnauthorizedException('Email not found');
    }
  }

  async login({ email, userId }, req: any) {
    try {
      const user = await UserRepository.getUserDetails(userId);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      if (user.isActive === false) {
        await this.accountManagementService.reactivateAccount(userId);
      }
      // ----- LOCATION DETECTION -----
      // const ip =
      //   req.headers['x-forwarded-for']?.toString().split(',')[0] ||
      //   req.socket.remoteAddress;
      const ip = '8.8.8.8';
      const geo = geoip.lookup(ip);
      const location = {
        ip,
        country: geo?.country || null,
        city: geo?.city || null,
        timezone: geo?.timezone || null,
        loginAt: new Date(),
      };

      if (user.isTwoFactorEnabled) {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = addMinutes(new Date(), 5);

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            twoFactorCode: code,
            twoFactorExpiresAt: expiresAt,
          },
        });

        // STEP 3: Send OTP
        if (user.isTwoFactorEnabled) {
          await this.mailService.sendOtpCodeToEmail({
            email: user.email,
            name: user.name,
            otp: code,
          });
        } else if (user.twoFactorMethod === 'phone') {
        }

        return {
          success: true,
          message: 'Two-factor authentication required',
          twoFactorRequired: true,
          userId: user.id,
        };
      }

      // If 2FA not enabled
      const payload = { email: user.email, sub: user.id, type: user.type };
      //const token = this.jwtService.sign(payload);
      const token = this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRY as StringValue, // '1d' works directly
      });

      // const sessionId = req.cookies?.cart_session;
      // if (sessionId) {
      //   await this.cartService.mergeGuestCartToUser(sessionId, user.id);
      // }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { country: location.country },
      });

      return {
        success: true,
        location: location,
        message: 'Logged in successfully',
        authorization: {
          token,
          type: 'bearer',
        },
        twoFactorRequired: false,
        type: user.type,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async verifyOtpTwoFactor({ userId, otp }) {
    try {
      // Fetch the user details from DB to get the OTP and expiry time
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          twoFactorCode: true,
          twoFactorExpiresAt: true,
          email: true,
          id: true,
          type: true,
        },
      });

      // Check if the OTP exists and is not expired
      if (!user || user.twoFactorCode !== otp) {
        return { success: false, message: 'Invalid OTP' };
      }

      if (new Date() > user.twoFactorExpiresAt) {
        return { success: false, message: 'OTP has expired' };
      }

      // OTP is valid, proceed with login and issue JWT token
      const payload = { email: user.email, sub: user.id };
      const token = this.jwtService.sign(payload);

      // Clear OTP from database to prevent reuse
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorCode: null,
          twoFactorExpiresAt: null,
        },
      });

      return {
        success: true,
        message: 'Logged in successfully',
        authorization: {
          token,
          type: 'bearer',
        },
        twoFactorRequired: false,
        type: user.type,
      };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // async register({ email, password }: { email: string; password: string }) {
  //   try {
  //     // Check if email already exists
  //     const userEmailExist = await UserRepository.exist({
  //       field: 'email',
  //       value: String(email),
  //     });

  //     if (userEmailExist) {
  //       return {
  //         success: false,
  //         statusCode: 409,
  //         message: 'Email already exists',
  //       };
  //     }

  //     // Create the user (no need to check for name uniqueness)
  //     const user = await UserRepository.createUser({
  //       email,
  //       password,
  //     });

  //     if (!user || user.success === false) {
  //       return {
  //         success: false,
  //         statusCode: 500,
  //         message: 'Failed to create account',
  //       };
  //     }

  //     // Create Stripe customer (if needed)
  //     const stripeCustomer = await StripePayment.createCustomer({
  //       user_id: user.data.id,
  //       email: email,
  //     });

  //     if (stripeCustomer) {
  //       await this.prisma.user.update({
  //         where: { id: user.data.id },
  //         data: { billing_id: stripeCustomer.id },
  //       });
  //     }

  //     // Notify admin
  //     const adminUsers = await this.prisma.user.findMany({
  //       where: { type: 'ADMIN' },
  //       select: { id: true },
  //     });

  //     for (const admin of adminUsers) {
  //       const dataToEmit = await this.notificationService.createNotification({
  //         receiver_id: admin.id,
  //         sender_id: user.data.id,
  //         message: `New user registered: ${user.data.email}`,
  //         type: 'register',
  //         post_id: null,
  //       });

  //       this.notificationGateway.notifyAdmin(admin.id, dataToEmit);
  //     }

  //     return {
  //       success: true,
  //       statusCode: 201,
  //       message: 'Registered successfully',
  //       data: {
  //         userId: user.data.id,
  //         email: user.data.email,
  //       },
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       statusCode: 500,
  //       message: error?.message || 'Something went wrong',
  //     };
  //   }
  // }

  //   async getAllUsers() {
  //   try {
  //     const users = await this.prisma.user.findMany({
  //       where: {
  //         type: 'user',
  //         deleted_at: null,
  //       },
  //       select: {
  //         id: true,
  //         email: true,
  //         username: true,
  //         name: true,
  //         avatar: true,
  //         country: true,
  //         city: true,
  //         status: true,
  //         isActive: true,
  //         created_at: true,
  //       },
  //       orderBy: {
  //         created_at: 'desc',
  //       },
  //     });

  //     return {
  //       success: true,
  //       statusCode: 200,
  //       message: 'Users fetched successfully',
  //       data: users,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       statusCode: 500,
  //       message: error?.message || 'Failed to fetch users',
  //     };
  //   }
  // }

  async register({
    email,
    password,
    confirm_password,
    first_name,
    last_name,
  }: {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
  }) {
    try {
      if (password !== confirm_password) {
        return {
          success: false,
          statusCode: 400,
          message: 'Passwords do not match',
        };
      }

      const userEmailExist = await UserRepository.exist({
        field: 'email',
        value: String(email),
      });

      if (userEmailExist) {
        return {
          success: false,
          statusCode: 409,
          message: 'Email already exists',
        };
      }

      const user = await UserRepository.createUser({
        email,
        password,
        first_name,
        last_name,
        name: `${first_name} ${last_name}`.trim(),
      });

      if (!user || user.success === false) {
        return {
          success: false,
          statusCode: 500,
          message: 'Failed to create account',
        };
      }

      const stripeCustomer = await StripePayment.createCustomer({
        user_id: user.data.id,
        email,
      });

      if (stripeCustomer) {
        await this.prisma.user.update({
          where: { id: user.data.id },
          data: { billing_id: stripeCustomer.id },
        });
      }

      const adminUsers = await this.prisma.user.findMany({
        where: { type: 'ADMIN' },
        select: { id: true },
      });

      for (const admin of adminUsers) {
        const dataToEmit = await this.notificationService.createNotification({
          receiver_id: admin.id,
          sender_id: user.data.id,
          message: `New user registered: ${user.data.email}`,
          type: 'register',
          post_id: null,
        });

        this.notificationGateway.notifyAdmin(admin.id, dataToEmit);
      }

      return {
        success: true,
        statusCode: 201,
        message: 'Registered successfully',
        data: {
          userId: user.data.id,
          email: user.data.email,
          first_name: user.data.first_name,
          last_name: user.data.last_name,
          name: user.data.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error?.message || 'Something went wrong',
      };
    }
  }
  async getUsersWithPagination(page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where: {
            type: 'user',
            deleted_at: null,
          },
          skip,
          take: limit,
          orderBy: {
            created_at: 'desc',
          },
          select: {
            id: true,
            email: true,
            username: true,
            name: true,
            avatar: true,
            country: true,
            city: true,
            isActive: true,
            status: true,
            created_at: true,
          },
        }),
        this.prisma.user.count({
          where: {
            type: 'user',
            deleted_at: null,
          },
        }),
      ]);

      return {
        success: true,
        statusCode: 200,
        message: 'Users fetched successfully',
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        data: users,
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 500,
        message: error?.message || 'Failed to fetch users',
      };
    }
  }

  async getAdminUsers() {
    return this.prisma.user.findMany({
      where: {
        type: 'ADMIN', // Assuming you have a field 'type' to differentiate between user roles
      },
      select: {
        id: true,
        email: true, // You can add more fields if needed
      },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
  }

  async forgotPassword(email: string) {
    try {
      const user = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (user) {
        const token = await UcodeRepository.createToken({
          userId: user.id,
          isOtp: true,
        });

        await this.mailService.sendOtpCodeToEmail({
          email: email,
          name: user.name,
          otp: token,
        });

        return {
          success: true,
          message: 'We have sent an OTP code to your email',
        };
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async resetPassword({ email, token, password }) {
    try {
      const user = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (user) {
        const existToken = await UcodeRepository.validateToken({
          email: email,
          token: token,
        });

        if (existToken) {
          await UserRepository.changePassword({
            email: email,
            password: password,
          });

          // delete otp code
          await UcodeRepository.deleteToken({
            email: email,
            token: token,
          });

          return {
            success: true,
            message: 'Password updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid token',
          };
        }
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async verifyEmail({ email, token }) {
    try {
      const user = await UserRepository.exist({
        field: 'email',
        value: email,
      });

      if (user) {
        const existToken = await UcodeRepository.validateToken({
          email: email,
          token: token,
        });

        if (existToken) {
          await this.prisma.user.update({
            where: {
              id: user.id,
            },
            data: {
              email_verified_at: new Date(Date.now()),
            },
          });

          // delete otp code
          await UcodeRepository.deleteToken({
            email: email,
            token: token,
          });

          return {
            success: true,
            message: 'Email verified successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid token',
          };
        }
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      const user = await UserRepository.getUserByEmail(email);

      if (user) {
        // create otp code
        const token = await UcodeRepository.createToken({
          userId: user.id,
          isOtp: true,
        });

        // send otp code to email
        await this.mailService.sendOtpCodeToEmail({
          email: email,
          name: user.name,
          otp: token,
        });

        return {
          success: true,
          message: 'We have sent a verification code to your email',
        };
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async changePassword({ user_id, oldPassword, newPassword }) {
    try {
      const user = await UserRepository.getUserDetails(user_id);

      if (user) {
        const _isValidPassword = await UserRepository.validatePassword({
          email: user.email,
          password: oldPassword,
        });
        if (_isValidPassword) {
          await UserRepository.changePassword({
            email: user.email,
            password: newPassword,
          });

          return {
            success: true,
            message: 'Password updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid password',
          };
        }
      } else {
        return {
          success: false,
          message: 'Email not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  //change password for specific user don't need email. user only change his own password
  async changePasswordForUser(
    user_id: string,
    oldPassword: string,
    newPassword: string,
  ) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        const _isValidPassword = await UserRepository.validatePassword({
          email: user.email,
          password: oldPassword,
        });
        if (_isValidPassword) {
          await UserRepository.changePassword({
            email: user.email,
            password: newPassword,
          });

          return {
            success: true,
            message: 'Password updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid password',
          };
        }
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async requestEmailChange(user_id: string, email: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        const token = await UcodeRepository.createToken({
          userId: user.id,
          isOtp: true,
          email: email,
        });

        await this.mailService.sendOtpCodeToEmail({
          email: email,
          name: email,
          otp: token,
        });

        return {
          success: true,
          message: 'We have sent an OTP code to your email',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async changeEmail({
    user_id,
    new_email,
    token,
  }: {
    user_id: string;
    new_email: string;
    token: string;
  }) {
    try {
      const user = await UserRepository.getUserDetails(user_id);

      if (user) {
        const existToken = await UcodeRepository.validateToken({
          email: new_email,
          token: token,
          forEmailChange: true,
        });

        if (existToken) {
          await UserRepository.changeEmail({
            user_id: user.id,
            new_email: new_email,
          });

          // delete otp code
          await UcodeRepository.deleteToken({
            email: new_email,
            token: token,
          });

          return {
            success: true,
            message: 'Email updated successfully',
          };
        } else {
          return {
            success: false,
            message: 'Invalid token',
          };
        }
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // --------- 2FA ---------
  async generate2FASecret(user_id: string) {
    try {
      return await UserRepository.generate2FASecret(user_id);
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async verify2FA(user_id: string, token: string) {
    try {
      const isValid = await UserRepository.verify2FA(user_id, token);
      if (!isValid) {
        return {
          success: false,
          message: 'Invalid token',
        };
      }
      return {
        success: true,
        message: '2FA verified successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async enable2FA(user_id: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        await UserRepository.enable2FA(user_id);
        return {
          success: true,
          message: '2FA enabled successfully',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async disable2FA(user_id: string) {
    try {
      const user = await UserRepository.getUserDetails(user_id);
      if (user) {
        await UserRepository.disable2FA(user_id);
        return {
          success: true,
          message: '2FA disabled successfully',
        };
      } else {
        return {
          success: false,
          message: 'User not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
  // --------- end 2FA ---------

  //    Tohidl 2Fa ------------------------------------------------------------

  async send2FACode(userId: string, method: 'email' | 'phone') {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

    await this.mailService.sendOtpCodeToEmail({
      email: user.email,
      name: user.name,
      otp: code,
    });

    const expiresAt = addMinutes(new Date(), 5); // 5 min expiry

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorCode: code,
        twoFactorExpiresAt: expiresAt,
        twoFactorMethod: method,
      },
    });

    if (method === 'email') {
      // Send via email (using MailService or nodemailer)
      console.log(`Send email code to ${user.email}: ${code}`);
    } else {
      // Send via SMS (Twilio or other)
      console.log(`Send SMS code to ${user.phone_number}: ${code}`);
    }

    return { message: `Code sent to your ${method}` };
  }

  async verify2FACode(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.twoFactorCode || !user.twoFactorExpiresAt) {
      throw new UnauthorizedException('2FA not initiated');
    }

    const isExpired = new Date() > user.twoFactorExpiresAt;
    if (isExpired || user.twoFactorCode !== code) {
      throw new UnauthorizedException('Invalid or expired code');
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        isTwoFactorEnabled: true,
        twoFactorCode: null,
        twoFactorExpiresAt: null,
      },
    });

    return { message: '2FA enabled successfully' };
  }

  async verifyOtpOnly({ email, token }: { email: string; token: string }) {
    try {
      const isValid = await UcodeRepository.checkTokenOnly({ email, token });
      if (isValid) {
        return {
          success: true,
          message: 'OTP is valid',
        };
      } else {
        return {
          success: false,
          message: 'Invalid or expired OTP',
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
