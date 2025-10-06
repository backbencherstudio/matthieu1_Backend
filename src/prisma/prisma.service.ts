import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { SoftdeleteMiddleware } from "./middleware/softdelete.middleware";

@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query'>
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({ log: [{ emit: 'event', level: 'query' }] });

    if (process.env.PRISMA_ENV == '1') {
      console.log('Prisma Middleware not called', process.env.PRISMA_ENV);
    } else {
      // only if $use exists
      if (typeof (this as any).$use === 'function') {
        (this as any).$use(SoftdeleteMiddleware);
      } else {
        console.warn('⚠️ Prisma middleware not supported in this Prisma version');
      }
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
