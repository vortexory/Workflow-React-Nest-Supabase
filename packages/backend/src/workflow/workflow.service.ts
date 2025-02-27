import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { Workflow, WorkflowExecution } from '@prisma/client';
import { IWorkflow, INodeData, WorkflowStatus, INodeExecutionResult } from '@workflow-automation/common';

@Injectable()
export class WorkflowService implements OnModuleInit, OnModuleDestroy {
  private runningWorkflows: Map<string, boolean> = new Map();

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure clean connection on startup
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    // Properly disconnect to clean up prepared statements
    await this.prisma.$disconnect();
  }

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
    // Use a new PrismaClient instance for this query to avoid prepared statement conflicts
    const result = await this.prisma.$transaction(async (tx) => {
      return tx.workflow.findMany({
        include: {
          executions: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        },
      });
    });
    return result;
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
        nodeResults: {},
      },
    });
  }

  async updateExecution(
    id: string,
    status: WorkflowStatus,
    nodeResults?: Record<string, INodeExecutionResult>,
    activeNodeId?: string | null
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

    if (activeNodeId !== undefined) {
      data.nodeResults = {
        ...(data.nodeResults || {}),
        activeNodeId,
      };
    }

    return this.prisma.workflowExecution.update({
      where: { id },
      data,
    });
  }

  async executeWorkflow(workflow: IWorkflow): Promise<void> {
    this.runningWorkflows.set(workflow.id, true);
    
    try {
      // Update execution status to running
      await this.prisma.workflowExecution.create({
        data: {
          workflowId: workflow.id,
          status: 'running',
          nodeResults: {},
        },
      });

      const execution = await this.createExecution(workflow.id);
      const nodes = workflow.nodes;
      const edges = workflow.edges;

      try {
        const nodeConnections = edges.reduce((acc, edge) => {
          if (!acc[edge.source]) {
            acc[edge.source] = [];
          }
          acc[edge.source].push({
            target: edge.target,
            condition: edge.sourceHandle,
          });
          return acc;
        }, {} as Record<string, { target: string; condition: string | undefined }[]>);

        const startNodes = nodes.filter(node => 
          !edges.some(edge => edge.target === node.id)
        );

        for (const startNode of startNodes) {
          await this.executeNode(startNode, workflow, nodes, nodeConnections, execution.id);
        }

        await this.updateExecution(execution.id, 'completed');
      } catch (error) {
        console.error('Workflow execution failed:', error);
        await this.updateExecution(
          execution.id,
          'failed',
          { error: error.message }
        );
      }
    } catch (error) {
      this.runningWorkflows.delete(workflow.id);
      throw error;
    }
  }

  async stopWorkflow(workflowId: string) {
    this.runningWorkflows.set(workflowId, false);
    
    await this.prisma.workflowExecution.create({
      data: {
        workflowId: workflowId,
        status: 'stopped',
        nodeResults: {},
      },
    });

    return { success: true };
  }

  private async executeNode(
    node: INodeData,
    workflow: IWorkflow,
    nodes: INodeData[],
    nodeConnections: Record<string, { target: string; condition: string | undefined }[]>,
    executionId: string
  ): Promise<void> {
    // Check if workflow should stop
    if (!this.runningWorkflows.get(workflow.id)) {
      return null;
    }

    try {
      await this.updateExecution(
        executionId,
        'running',
        {
          [node.id]: {
            status: 'running',
            message: `Executing ${node.data.name}...`,
            startTime: new Date(),
          }
        },
        node.id
      );

      await new Promise(resolve => setTimeout(resolve, 1000));

      await this.updateExecution(
        executionId,
        'running',
        {
          [node.id]: {
            status: 'completed',
            message: `Executed ${node.data.name}`,
            endTime: new Date(),
            output: { success: true },
          },
        },
        node.id
      );

      const nextConnections = nodeConnections[node.id] || [];
      
      for (const connection of nextConnections) {
        const targetNode = nodes.find(n => n.id === connection.target);
        if (targetNode) {
          await this.executeNode(targetNode, workflow, nodes, nodeConnections, executionId);
        }
      }
    } catch (error) {
      await this.updateExecution(
        executionId,
        'running',
        {
          [node.id]: {
            status: 'failed',
            message: error.message,
            endTime: new Date(),
            error: error.message,
          },
        },
        node.id
      );
      throw error;
    }
  }
}
