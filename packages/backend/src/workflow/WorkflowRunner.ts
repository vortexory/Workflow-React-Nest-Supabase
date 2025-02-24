import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStatus, IWorkflow, INodeExecutionResult } from '@workflow-automation/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkflowRunner {
  constructor(private prisma: PrismaService) {}

  async execute(workflow: IWorkflow, executionId: string, input: any = {}): Promise<void> {
    try {
      // Update execution status to running
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowStatus.RUNNING,
          startTime: new Date(),
        },
      });

      const nodeResults: Record<string, INodeExecutionResult> = {};
      let currentInput = input;

      // Execute nodes in sequence
      for (const node of workflow.nodes) {
        const startTime = new Date();
        try {
          // Here you would implement the actual node execution logic
          const endTime = new Date();
          const result: INodeExecutionResult = {
            status: 'completed',
            data: { ...currentInput, nodeId: node.id },
            startTime,
            endTime
          };

          nodeResults[node.id] = result;
          currentInput = result.data;
        } catch (error) {
          const endTime = new Date();
          nodeResults[node.id] = {
            status: 'failed',
            error: error.message,
            startTime,
            endTime
          };

          // Update execution with error
          await this.prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
              status: WorkflowStatus.FAILED,
              nodeResults: nodeResults as unknown as Prisma.JsonValue,
              endTime: new Date(),
            },
          });

          throw error;
        }
      }

      // Update execution with success
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowStatus.COMPLETED,
          nodeResults: nodeResults as unknown as Prisma.JsonValue,
          endTime: new Date(),
        },
      });

    } catch (error) {
      // If we get here, something went wrong outside of node execution
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowStatus.FAILED,
          nodeResults: { error: error.message } as Prisma.JsonValue,
          endTime: new Date(),
        },
      });

      throw error;
    }
  }
}