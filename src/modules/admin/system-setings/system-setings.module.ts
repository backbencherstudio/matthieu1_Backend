import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RolesGuard } from 'src/common/guard/role/roles.guard';
import { APP_GUARD } from '@nestjs/core';
import { SystemSettingsController } from './system-setings.controller';
import { SystemSettingsService } from './system-setings.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Module({
  controllers: [SystemSettingsController],
  providers: [
    SystemSettingsService,
    PrismaService,
    // Optionally apply guards globally for this module
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class SystemSettingsModule {}
