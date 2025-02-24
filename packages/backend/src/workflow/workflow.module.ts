import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowExecutionService } from './workflow-execution.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    ...(process.env.REDIS_ENABLED === 'true'
      ? [
          BullModule.registerQueue({
            name: 'workflow',
          }),
        ]
      : []),
  ],
  controllers: [WorkflowController],
  providers: [
    WorkflowService,
    WorkflowExecutionService,
  ],
  exports: [WorkflowService, WorkflowExecutionService],
})
export class WorkflowModule {}
