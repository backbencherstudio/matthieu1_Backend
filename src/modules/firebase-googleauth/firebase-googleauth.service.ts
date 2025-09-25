import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from '../application/notification/notification.service';
import { NotificationGateway } from '../application/notification/notification.gateway';

@Injectable()
export class FirebaseGoogleAuthService {
  private readonly logger = new Logger(FirebaseGoogleAuthService.name);

  constructor(
    private readonly firebaseAdmin: FirebaseAdminService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Google login flow supporting:
   * - token-based login (idToken)
   * - direct-info login (providedEmail + providedName) — generates synthetic uid
   *
   * Notifications to admins are sent only when a user is created for the first time in this flow.
   */
  async googleLogin(
    idToken?: string,
    providedName?: string,
    providedEmail?: string,
    providedProfilePic?: string,
  ) {
    try {
      // normalize inputs
      let uid: string;
      let email: string;
      let name: string | null;
      let picture: string | null;

      if (idToken) {
        this.logger.log('Verifying Firebase ID token');
        const decoded = await this.firebaseAdmin.verifyIdToken(idToken);

        if (!decoded || !decoded.email) {
          this.logger.warn('Invalid Firebase token or missing email in token');
          throw new UnauthorizedException('Invalid Firebase token or missing email');
        }

        uid = decoded.uid;
        email = (providedEmail || decoded.email).toString().trim().toLowerCase();
        name = (providedName || decoded.name) ?? null;
        picture = (providedProfilePic || decoded.picture) ?? null;
      } else {
        // direct info auth (fallback)
        if (!providedEmail) {
          throw new BadRequestException('Email is required when not using ID token');
        }
        uid = `direct_auth_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        email = String(providedEmail).trim().toLowerCase();
        name = providedName ?? 'User';
        picture = providedProfilePic ?? null;

        this.logger.log(`Direct authentication with email: ${email}`);
      }

      this.logger.log(`Firebase authentication success for: ${email}`);

      // 1) Lookup user by google_id then by email
      let user = await this.prisma.user.findUnique({
        where: { google_id: uid },
      });

      if (!user) {
        user = await this.prisma.user.findUnique({ where: { email } });
      }

      // 2) Create or update user. Track whether created in this call.
      let isNewUser = false;

      if (!user) {
        this.logger.log(`Creating new user record for email: ${email}`);
        try {
          user = await this.prisma.user.create({
            data: {
              google_id: uid,
              email,
              name,
              avatar: picture,
              isActive: true,
              type: 'user',
            },
          });
          isNewUser = true;
          this.logger.log(`User created (id=${user.id})`);
        } catch (error) {
          this.logger.error(`Failed to create user for email ${email}`, error?.stack || error);
          // If a unique constraint race happened, try to fetch by email to recover
          try {
            const fallback = await this.prisma.user.findUnique({ where: { email } });
            if (fallback) {
              user = fallback;
              this.logger.warn('User creation race detected — using existing user record.');
            } else {
              throw error;
            }
          } catch (fallbackErr) {
            throw new InternalServerErrorException('Failed to create user account');
          }
        }
      } else if (!user.google_id) {
        // If user exists but google_id missing, link it (not considered a "new" registration for notifications)
        this.logger.log(`Linking Google ID to existing user (id=${user.id})`);
        try {
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { google_id: uid, avatar: picture ?? user.avatar, name: user.name ?? name },
          });
          this.logger.log(`Linked google_id for user ${user.id}`);
        } catch (error) {
          this.logger.error(`Failed to link google_id for user ${user.id}`, error?.stack || error);
          throw new InternalServerErrorException('Failed to link Google account');
        }
      }

      // 3) Notify admins only if user was created in this flow
      if (isNewUser) {
        this.logger.log('New user created via Google — dispatching admin notifications');

        try {
          const adminUsers = await this.prisma.user.findMany({
            where: { type: 'admin' },
            select: { id: true },
          });

          this.logger.log(`Notifying ${adminUsers.length} admin(s)`);

          // Parallel notifications — do not fail the login if a notification fails
          await Promise.allSettled(
            adminUsers.map(async (admin) => {
              try {
                const dataToEmit = await this.notificationService.createNotification({
                  receiver_id: admin.id,
                  sender_id: user.id,
                  message: `New user registered via Google: ${user.email}`,
                  type: 'register',
                  post_id: null,
                });

                // notifyAdmin could be async; await so we attempt delivery
                await this.notificationGateway.notifyAdmin(admin.id, dataToEmit);
                this.logger.log(`Notification emitted to admin ${admin.id}`);
              } catch (err) {
                this.logger.error(`Failed to notify admin ${admin.id}`, err?.stack || err);
                // swallow
              }
            }),
          );
        } catch (err) {
          // Failure to fetch admin users or other unexpected errors should not block auth
          this.logger.error('Failed to process admin notifications', err?.stack || err);
        }
      }

      // 4) Generate JWT token & respond
      const payload = { sub: user.id, email: user.email, type: user.type };
      const token = this.jwtService.sign(payload);
      this.logger.log(`JWT token generated for user: ${user.id}`);

      return {
        success: true,
        message: 'Google login success',
        authorization: {
          token,
          type: 'bearer',
        },
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      this.logger.error('Google login failed', error?.stack || error);

      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Authentication failed. Please try again later.');
    }
  }
}
