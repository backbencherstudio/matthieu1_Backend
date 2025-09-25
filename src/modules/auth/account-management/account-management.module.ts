import { Module } from '@nestjs/common';
import { AccountManagementService } from './account-management.service';
import { AccountManagementController } from './account-management.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [AccountManagementService, PrismaService],
  controllers: [AccountManagementController],
  exports: [AccountManagementService],
})
export class AccountManagementModule {}
