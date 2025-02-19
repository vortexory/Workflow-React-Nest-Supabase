import { Injectable } from '@nestjs/common';
import { IWorkflow, INodeData, INodeExecutionData, INodeExecutionResult } from '@workflow-automation/common';
import { NodeFactory } from '../nodes/base/NodeFactory';

@Injectable()
export class WorkflowExecutorService {
  constructor(
    private readonly nodeFactory: NodeFactory,
  ) {}

  async executeNode(
    node: INodeData,
    inputData: INodeExecutionData[] = []
  ): Promise<INodeExecutionData[]> {
    try {
      // Create node instance
      const nodeInstance = this.nodeFactory.createNode(node.type);

      // Initialize node with settings
      await nodeInstance.onInit(node.data.settings);

      // Execute node
      return await nodeInstance.execute(inputData);
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
