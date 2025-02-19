import { Process, Processor } from '@nestjs/bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { WorkflowEntity } from './entities/workflow.entity';
import { INodeExecutionResult } from '@workflow-automation/common';

@Processor('workflow')
export class WorkflowProcessor {
  constructor(
    @InjectRepository(WorkflowExecutionEntity)
    private executionRepository: Repository<WorkflowExecutionEntity>,
    @InjectRepository(WorkflowEntity)
    private workflowRepository: Repository<WorkflowEntity>,
  ) {}

  @Process('execute')
  async executeWorkflow(job: Job<{ workflowId: string; executionId: string; input: any }>) {
    const { workflowId, executionId, input } = job.data;
    
    try {
      // Update execution status to running
      await this.executionRepository.update(executionId, { status: 'running' });
      
      const workflow = await this.workflowRepository.findOne({ where: { id: workflowId } });
      const execution = await this.executionRepository.findOne({ where: { id: executionId } });
      
      if (!workflow || !execution) {
        throw new Error('Workflow or execution not found');
      }

      const nodeResults: { [nodeId: string]: INodeExecutionResult } = {};
      let output = input;

      // Simple sequential execution for now
      for (const node of workflow.nodes) {
        try {
          const startTime = new Date();
          // Here you would implement the actual node execution logic
          // For now, we'll just simulate success
          nodeResults[node.id] = {
            status: 'completed',
            output: { ...output, nodeId: node.id },
            error: null,
            startTime,
            endTime: new Date()
          };
          output = nodeResults[node.id].output;
        } catch (error) {
          const startTime = new Date();
          nodeResults[node.id] = {
            status: 'failed',
            output: null,
            error: error.message,
            startTime,
            endTime: new Date()
          };
          throw error;
        }
      }

      // Update execution with results
      await this.executionRepository.update(executionId, {
        status: 'completed',
        output,
        nodeResults,
        endTime: new Date(),
      });
      
    } catch (error) {
      // Update execution with error
      await this.executionRepository.update(executionId, {
        status: 'failed',
        error: error.message,
        endTime: new Date(),
      });
    }
  }
}
