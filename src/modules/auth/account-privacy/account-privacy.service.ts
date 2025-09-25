import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class AccountPrivacyService {
  constructor(private readonly prisma: PrismaService) {}

  async togglePrivacy(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isPrivate: true },
      });

      const newPrivacy = !user.isPrivate;

      await this.prisma.user.update({
        where: { id: userId },
        data: { isPrivate: newPrivacy },
      });

      // if (newPrivacy) {
      //   await this.prisma.socialMediaPost.updateMany({
      //     where: { user_id: userId },
      //     data: { privacy: PrivacyCategory.Friends },
      //   });
      // }

      return {
        success: true,
        message: newPrivacy
          ? 'Account set to private and posts hidden'
          : 'Account set to public',
      };
    } catch (error) {
      console.error('Error toggling account privacy:', error);
      throw new Error(
        error.message || 'An error occurred while toggling account privacy.',
      );
    }
  }
}
