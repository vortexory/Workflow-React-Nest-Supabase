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
        executions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
    });
  }

  async findOne(id: string): Promise<Workflow | null> {
    return this.prisma.workflow.findUnique({
      where: { id },
      include: {
        executions: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
    });
  }

  async update(id: string, updateWorkflowDto: UpdateWorkflowDto): Promise<Workflow> {
    return this.prisma.workflow.update({
      where: { id },
      data: {
        name: updateWorkflowDto.name,
        nodes: updateWorkflowDto.nodes,
        edges: updateWorkflowDto.edges,
      },
    });
  }

  async remove(id: string): Promise<Workflow> {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  async createExecution(workflowId: string): Promise<WorkflowExecution> {
    return this.prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running',
      },
    });
  }

  async updateExecution(
    id: string,
    status: WorkflowStatus,
    nodeResults?: Record<string, any>
  ): Promise<WorkflowExecution> {
    const data: any = {
      status,
    };

    if (status === 'completed' || status === 'failed') {
      data.endTime = new Date();
    }

    if (nodeResults) {
      data.nodeResults = nodeResults;
    }

    return this.prisma.workflowExecution.update({
      where: { id },
      data,
    });
  }
}
