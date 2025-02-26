import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { INodeType, WorkflowStatus, INodeExecutionResult } from '@workflow-automation/common';

interface WorkflowState {
  nodes: Node<INodeType>[];
  edges: Edge[];
  executionStatus: WorkflowStatus;
  activeNodeId: string | null;
  nodeResults: Record<string, INodeExecutionResult>;
}

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  executionStatus: 'idle',
  activeNodeId: null,
  nodeResults: {},
};

export const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node<INodeType>[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    setExecutionStatus: (state, action: PayloadAction<WorkflowStatus>) => {
      state.executionStatus = action.payload;
    },
    setActiveNodeId: (state, action: PayloadAction<string | null>) => {
      state.activeNodeId = action.payload;
    },
    setNodeResult: (state, action: PayloadAction<{ id: string; result: INodeExecutionResult }>) => {
      const { id, result } = action.payload;
      state.nodeResults[id] = result;
    },
    setNodeResults: (state, action: PayloadAction<Record<string, INodeExecutionResult>>) => {
      state.nodeResults = action.payload;
    },
    clearNodeResults: (state) => {
      state.nodeResults = {};
    },
    resetExecution: (state) => {
      state.executionStatus = 'idle';
      state.activeNodeId = null;
      state.nodeResults = {};
    },
  },
});

export const { 
  setNodes, 
  setEdges, 
  setExecutionStatus, 
  setActiveNodeId,
  setNodeResult,
  setNodeResults,
  clearNodeResults,
  resetExecution,
} = workflowSlice.actions;

export default workflowSlice.reducer;
