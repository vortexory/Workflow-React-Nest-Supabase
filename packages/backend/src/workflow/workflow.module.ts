import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { WorkflowProcessor } from './workflow.processor';
import { WorkflowRunner } from './WorkflowRunner';
import { NodesModule } from '../nodes/nodes.module';
import { WorkflowExecutionService } from './workflow-execution.service';
import { WorkflowExecutorService } from './workflow-executor.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkflowEntity, WorkflowExecutionEntity]),
    ConfigModule,
    NodesModule,
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
    WorkflowExecutorService,
    WorkflowRunner,
    WorkflowExecutionService,
    WorkflowService,
    ...(process.env.REDIS_ENABLED === 'true' ? [WorkflowProcessor] : []),
  ],
  exports: [WorkflowService, WorkflowRunner],
})
export class WorkflowModule {}
