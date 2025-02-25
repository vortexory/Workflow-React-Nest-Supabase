import { INodeData } from './node.types';

export interface IWorkflow {
  id: string;
  name: string;
  nodes: INodeData[];
  edges: IEdge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface IWorkflowExecutionData {
  workflowId: string;
  status: WorkflowStatus;
  startTime: Date;
  endTime?: Date;
  nodeResults: {
    [nodeId: string]: INodeExecutionResult;
  };
}

export type WorkflowStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'idle';

export interface INodeExecutionResult {
  status: NodeExecutionStatus;
  startTime: Date;
  endTime?: Date;
  data?: any;
  input?: any;
  output?: any;
  error?: string;
}

export type NodeExecutionStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped';