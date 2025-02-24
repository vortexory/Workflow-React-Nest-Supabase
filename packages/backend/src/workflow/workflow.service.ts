import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { Workflow, WorkflowExecution } from '@prisma/client';
import { IWorkflow, IWorkflowExecutionData, WorkflowStatus } from '@workflow-automation/common';

@Injectable()
export class WorkflowService {
  constructor(private prisma: PrismaService) {}

  async create(createWorkflowDto: CreateWorkflowDto): Promise<Workflow> {
    return this.prisma.workflow.create({
      data: {
        name: createWorkflowDto.name,
        nodes: createWorkflowDto.nodes,
        edges: createWorkflowDto.edges,
      },
    });
  }

  async findAll(): Promise<Workflow[]> {
    return this.prisma.workflow.findMany({
      include: {
        executions: true,
      },
    });
  }

  async findOne(id: string): Promise<Workflow | null> {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: true,
      },
    });

    if (!workflow) {
      throw new Error(`Workflow with ID ${id} not found`);
    }

    return workflow;
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<Workflow> {
    const workflow = await this.findOne(id);

    return this.prisma.workflow.update({
      where: { id },
      data: {
        name: updateWorkflowDto.name,
        nodes: updateWorkflowDto.nodes,
        edges: updateWorkflowDto.edges,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const workflow = await this.findOne(id);
    
    await this.prisma.workflow.delete({
      where: { id },
    });
  }

  async execute(id: string): Promise<WorkflowExecution> {
    const workflow = await this.findOne(id);
    
    const execution = await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
        nodeResults: {},
      },
    });

    try {
      // Execute workflow logic here
      // Update node results as they complete
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'completed',
          endTime: new Date(),
        },
      });

      return execution;
    } catch (error) {
      await this.prisma.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: 'failed',
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
}
