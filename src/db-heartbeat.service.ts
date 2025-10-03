import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DbHeartbeatService {
  private readonly logger = new Logger(DbHeartbeatService.name);

  constructor(private prisma: PrismaService) {}

  // Run every 5 minutes
  // @Cron('*/5 * * * *')
  // async keepAlive() {
  //   try {
  //     await this.prisma.$queryRaw`SELECT 1`;
  //     this.logger.debug('DB heartbeat sent ✅');
  //   } catch (err) {
  //     this.logger.error('DB heartbeat failed ❌', err);
  //   }
  // }
}
