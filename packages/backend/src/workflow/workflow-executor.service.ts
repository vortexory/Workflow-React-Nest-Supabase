import { Injectable } from '@nestjs/common';
import { IWorkflow, INodeData, INodeExecutionData, INodeExecutionResult } from '@workflow-automation/common';
import { nodeDatabase } from '../nodes/node-database';

@Injectable()
export class WorkflowExecutorService {
  constructor() {}

  async executeNode(
    node: INodeData,
    inputData: INodeExecutionData[] = []
  ): Promise<INodeExecutionData[]> {
    try {
      // Use nodeDatabase to execute the node
      if (!nodeDatabase[node.type]) {
        throw new Error(`No executor found for node type: ${node.type}`);
      }

      const result = await nodeDatabase[node.type].execute({
        input: inputData,
        settings: node.data.settings,
      });

      if (result.success) {
        return result.output || [];
      } else {
        throw new Error(result.error || 'Node execution failed');
      }
    } catch (error) {
      throw new Error(`Error executing node ${node.data.name}: ${error.message}`);
    }
  }

  getNodeInputs(
    workflow: IWorkflow,
    nodeId: string,
    nodeResults: { [key: string]: INodeExecutionResult }
  ): INodeExecutionData[] {
    const inputNodes = workflow.edges
      .filter(edge => edge.target === nodeId)
      .map(edge => edge.source);

    if (inputNodes.length === 0) {
      return [];
    }

    return inputNodes.reduce((acc, inputNodeId) => {
      const nodeResult = nodeResults[inputNodeId];
      if (nodeResult?.status === 'completed' && nodeResult.output) {
        return [...acc, ...nodeResult.output];
      }
      return acc;
    }, [] as INodeExecutionData[]);
  }

  topologicalSort(workflow: IWorkflow): string[] {
    const visited = new Set<string>();
    const temp = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (temp.has(nodeId)) {
        throw new Error('Workflow has a cycle');
      }
      if (visited.has(nodeId)) {
        return;
      }
      temp.add(nodeId);

      const outgoingEdges = workflow.edges.filter(edge => edge.source === nodeId);
      for (const edge of outgoingEdges) {
        visit(edge.target);
      }

      temp.delete(nodeId);
      visited.add(nodeId);
      order.unshift(nodeId);
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id)) {
        visit(node.id);
      }
    }

    return order;
  }
}
