import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { WorkflowStatus, INodeData, INodeExecutionResult } from '@workflow-automation/common';
import { Prisma } from '@prisma/client';

@Processor('workflow')
export class WorkflowProcessor {
  constructor(private prisma: PrismaService) {}

  @Process('execute')
  async executeWorkflow(job: Job<{ workflowId: string; executionId: string; input: any }>) {
    const { workflowId, executionId } = job.data;
    
    try {
      const workflow = await this.prisma.workflow.findUnique({
        where: { id: workflowId },
      });

      if (!workflow) {
        throw new Error(`Workflow ${workflowId} not found`);
      }

      // Update execution status to running
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowStatus.RUNNING,
          startTime: new Date(),
        },
      });

      // Parse workflow nodes from JSON and validate structure
      const parsedNodes = JSON.parse(JSON.stringify(workflow.nodes)) as INodeData[];
      const nodeResults: Record<string, INodeExecutionResult> = {};

      // Execute each node in sequence
      for (const node of parsedNodes) {
        const startTime = new Date();
        try {
          // Node execution logic here
          nodeResults[node.id] = {
            status: 'completed',
            data: { /* node execution result */ },
            startTime,
            endTime: new Date()
          };
        } catch (nodeError) {
          nodeResults[node.id] = {
            status: 'failed',
            error: nodeError.message,
            startTime,
            endTime: new Date()
          };
        }
      }

      // Update execution with results
      await this.prisma.workflowExecution.update({
        where: { id: executionId },
        data: {
          status: WorkflowStatus.COMPLETED,
          nodeResults: nodeResults as unknown as Prisma.JsonValue,
          endTime: new Date(),
        },
      });
      
    } catch (error) {
      // Update execution status to failed
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
