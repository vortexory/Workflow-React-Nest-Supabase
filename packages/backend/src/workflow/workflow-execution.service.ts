import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Workflow, WorkflowExecution } from '@prisma/client';

@Injectable()
export class WorkflowExecutionService {
  constructor(private prisma: PrismaService) {}

  async execute(workflow: Workflow, input: any = {}): Promise<WorkflowExecution> {
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'RUNNING',
        nodeResults: {},
      },
    });

    try {
      // Execute workflow logic here
      // Update node results as they complete
      const updatedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'COMPLETED',
          endTime: new Date(),
        },
      });

      return updatedExecution;
    } catch (error) {
      const failedExecution = await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'FAILED',
          endTime: new Date(),
        },
      });

      throw error;
    }
  }

  async getExecution(id: string): Promise<WorkflowExecution> {
    const execution = await this.prisma.workflowExecution.findUnique({
      where: { id },
      include: {
        workflow: true,
      },
    });

    if (!execution) {
      throw new Error(`Execution with ID ${id} not found`);
    }

    return execution;
  }

  async updateNodeResults(id: string, nodeResults: any): Promise<WorkflowExecution> {
    return this.prisma.workflowExecution.update({
      where: { id },
      data: {
        nodeResults,
      },
    });
  }
}
