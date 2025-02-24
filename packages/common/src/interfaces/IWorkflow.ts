export interface INodeData {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
}

export interface IWorkflow {
  id?: string;
  name: string;
  nodes: INodeData[];
  edges: IEdge[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INodeExecutionData {
  data: Record<string, any>;
}

export interface INodeExecutionResult {
  data: INodeExecutionData[];
  error?: Error;
}

export enum WorkflowStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
