import { INodeData } from './node.types';
import { IWorkflow, NodeExecutionStatus } from './workflow.types';

export interface INodeExecutionData {
  json: {
    [key: string]: any;
  };
  binary?: {
    [key: string]: IBinaryData;
  };
  error?: Error;
}

export interface IBinaryData {
  data: Buffer;
  mimeType: string;
  fileName?: string;
  fileSize?: number;
}

export interface IExecutionContext {
  workflow: IWorkflow;
  currentNode: INodeData;
  previousResults: {
    [nodeId: string]: any;
  };
}

export interface IExecutionResult {
  nodeId: string;
  status: NodeExecutionStatus;
  output?: any;
  error?: string;
}

export interface IExecutionOptions {
  timeout?: number;
  retryCount?: number;
  retryDelay?: number;
}