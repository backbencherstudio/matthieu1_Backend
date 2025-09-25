import { Injectable, NestMiddleware } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthGateMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = req.user;
    if (user) {
      const roles = await this.prisma.role.findMany({
        where: {
          user_id: (user as any).userId
        },
        include: {
          role_users: true
        }
      });
      
      // Store roles in request for later use if needed
      (req as any).userRoles = roles;
    }
    next();
  }
}
