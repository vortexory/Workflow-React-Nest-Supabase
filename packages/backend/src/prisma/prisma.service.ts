import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      // Add logging in development
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      // Configure connection handling
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      // Add connection error handling
      errorFormat: 'pretty',
      // Configure connection pool
    });
  }

  async onModuleInit() {
    // Clean up any existing connections
    await this.$disconnect();
    // Create a fresh connection
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
