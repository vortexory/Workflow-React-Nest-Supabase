import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { IWorkflow } from '@workflow-automation/common';
import { ConfigService } from '@nestjs/config';
import { WorkflowExecutionService } from './workflow-execution.service';

@Injectable()
export class WorkflowService {
  private supabase;

  constructor(
    @InjectRepository(WorkflowEntity)
    private workflowRepository: Repository<WorkflowEntity>,
    private workflowExecutionService: WorkflowExecutionService,
    private configService: ConfigService,
  ) {
    // Initialize Supabase client
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL'),
      this.configService.get<string>('SUPABASE_KEY')
    );
  }

  async create(workflow: IWorkflow): Promise<WorkflowEntity> {
    const workflowEntity = this.workflowRepository.create(workflow);
    const savedWorkflow = await this.workflowRepository.save(workflowEntity);

    // Sync to Supabase for real-time updates
    await this.supabase
      .from('workflows')
      .upsert({
        id: savedWorkflow.id,
        name: savedWorkflow.name,
        nodes: savedWorkflow.nodes,
        edges: savedWorkflow.edges,
        created_at: savedWorkflow.createdAt,
        updated_at: savedWorkflow.updatedAt,
      });

    return savedWorkflow;
  }

  async findAll(): Promise<WorkflowEntity[]> {
    return this.workflowRepository.find();
  }

  async findOne(id: string): Promise<WorkflowEntity> {
    const workflow = await this.workflowRepository.findOne({ where: { id } });
    if (!workflow) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }
    return workflow;
  }

  async update(id: string, workflow: IWorkflow): Promise<WorkflowEntity> {
    const existingWorkflow = await this.findOne(id);
    const updatedWorkflow = {
      ...existingWorkflow,
      ...workflow,
    };
    await this.workflowRepository.save(updatedWorkflow);

    // Sync to Supabase
    await this.supabase
      .from('workflows')
      .upsert({
        id: updatedWorkflow.id,
        name: updatedWorkflow.name,
        nodes: updatedWorkflow.nodes,
        edges: updatedWorkflow.edges,
        updated_at: new Date(),
      });

    return updatedWorkflow;
  }

  async remove(id: string): Promise<void> {
    const result = await this.workflowRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Workflow with ID ${id} not found`);
    }

    // Remove from Supabase
    await this.supabase
      .from('workflows')
      .delete()
      .eq('id', id);
  }

  async execute(workflowId: string, input: any = {}): Promise<WorkflowExecutionEntity> {
    const workflow = await this.findOne(workflowId);
    return this.workflowExecutionService.execute(workflow, input);
  }

  async getExecution(id: string): Promise<WorkflowExecutionEntity> {
    return this.workflowExecutionService.getExecution(id);
  }
}
