import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { WorkflowModule } from './workflow/workflow.module';
import { NodesModule } from './nodes/nodes.module';
import databaseConfig from '../config/database.config';
import queueConfig from '../config/queue.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, queueConfig],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: dbConfig.synchronize,
          logging: dbConfig.logging,
        };
      },
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const queueConfig = configService.get('queue');
        if (!queueConfig.enabled) {
          return {
            redis: {
              host: 'localhost',
              port: 6379,
            },
          };
        }
        return {
          redis: queueConfig.redis,
        };
      },
      inject: [ConfigService],
    }),
    WorkflowModule,
    NodesModule,
  ],
})
export class AppModule {}
