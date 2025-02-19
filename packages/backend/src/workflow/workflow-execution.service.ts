import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { WorkflowEntity } from './entities/workflow.entity';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { WorkflowStatus } from '@workflow-automation/common';
import { WorkflowRunner } from './WorkflowRunner';

@Injectable()
export class WorkflowExecutionService {
  private supabase;

  constructor(
    @InjectRepository(WorkflowExecutionEntity)
    private executionRepository: Repository<WorkflowExecutionEntity>,
    private workflowRunner: WorkflowRunner,
    private configService: ConfigService,
  ) {
    const dbConfig = this.configService.get('database');
    if (!dbConfig?.supabase?.url || !dbConfig?.supabase?.key) {
      throw new Error('Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_KEY environment variables.');
    }

    // Initialize Supabase client
    this.supabase = createClient(
      dbConfig.supabase.url,
      dbConfig.supabase.key
    );
  }

  async execute(workflow: WorkflowEntity, input: any = {}): Promise<WorkflowExecutionEntity> {
    // Create execution record
    const execution = this.executionRepository.create({
      workflowId: workflow.id,
      status: 'running' as WorkflowStatus,
      input,
      nodeResults: {},
    });
    
    const savedExecution = await this.executionRepository.save(execution);

    // Sync execution status to Supabase
    await this.supabase
      .from('workflow_executions')
      .upsert({
        id: savedExecution.id,
        workflow_id: workflow.id,
        status: 'running',
        input,
        node_results: {},
        start_time: savedExecution.startTime,
      });

    // Execute workflow asynchronously
    this.workflowRunner.execute(workflow, savedExecution).catch(async () => {
      // The error handling is done in WorkflowRunner
      await this.saveExecution(savedExecution);
    });

    return savedExecution;
  }

  async getExecution(id: string): Promise<WorkflowExecutionEntity> {
    const execution = await this.executionRepository.findOne({ 
      where: { id },
      relations: ['workflow'],
    });
    
    if (!execution) {
      throw new Error(`Execution with ID ${id} not found`);
    }
    
    return execution;
  }

  private async saveExecution(execution: WorkflowExecutionEntity): Promise<void> {
    await this.executionRepository.save(execution);

    // Sync to Supabase
    await this.supabase
      .from('workflow_executions')
      .upsert({
        id: execution.id,
        status: execution.status,
        node_results: execution.nodeResults,
        output: execution.output,
        error: execution.error,
        end_time: execution.endTime,
      });
  }
}
