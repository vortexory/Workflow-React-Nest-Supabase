import { Injectable } from '@nestjs/common';
import { IWorkflow, INodeData, INodeExecutionData, WorkflowStatus, INodeExecutionResult } from '@workflow-automation/common';
import { WorkflowExecutionEntity } from './entities/workflow-execution.entity';
import { WorkflowExecutorService } from './workflow-executor.service';

@Injectable()
export class WorkflowRunner {
  constructor(
    private readonly executorService: WorkflowExecutorService,
  ) {}

  async execute(workflow: IWorkflow, execution: WorkflowExecutionEntity): Promise<void> {
    try {
      const nodeOrder = this.executorService.topologicalSort(workflow);
      const nodeResults: { [nodeId: string]: INodeExecutionResult } = {};

      for (const nodeId of nodeOrder) {
        try {
          const node = workflow.nodes.find(n => n.id === nodeId);
          if (!node) {
            throw new Error(`Node ${nodeId} not found in workflow`);
          }

          // Get input data from previous nodes
          const inputData = this.executorService.getNodeInputs(workflow, nodeId, nodeResults);

          // Execute node
          const startTime = new Date();
          const outputData = await this.executorService.executeNode(node, inputData);
          const endTime = new Date();

          // Update node status to completed
          execution.nodeResults[nodeId] = {
            status: 'completed',
            startTime,
            endTime,
            output: outputData,
          };
          execution.status = 'running';

        } catch (error) {
          const startTime = new Date();
          const endTime = new Date();

          // Update node status to failed
          execution.nodeResults[nodeId] = {
            status: 'failed',
            startTime,
            endTime,
            error: error.message,
          };
          execution.status = 'failed';
          execution.error = error.message;
          throw error;
        }
      }

      // Update workflow execution status to completed
      execution.status = 'completed';
      execution.endTime = new Date();

    } catch (error) {
      // Update workflow execution status to failed
      execution.status = 'failed';
      execution.error = error.message;
      execution.endTime = new Date();
      throw error;
    }
  }
}