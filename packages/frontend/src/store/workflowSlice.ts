import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';
import { WorkflowStatus } from '@workflow-automation/common';

interface INodeResult {
  status: 'success' | 'error' | 'running';
  output?: any;
  error?: string;
}

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  executionStatus: WorkflowStatus;
  nodeResults: Record<string, INodeResult>;
}

const initialState: WorkflowState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  executionStatus: 'pending',
  nodeResults: {},
};

export const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setSelectedNode: (state, action: PayloadAction<Node | null>) => {
      state.selectedNode = action.payload;
    },
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action: PayloadAction<{ nodeId: string; data: any }>) => {
      const { nodeId, data } = action.payload;
      const node = state.nodes.find(n => n.id === nodeId);
      if (node) {
        node.data = { ...node.data, ...data };
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      const nodeId = action.payload;
      state.nodes = state.nodes.filter(node => node.id !== nodeId);
      state.edges = state.edges.filter(
        edge => edge.source !== nodeId && edge.target !== nodeId
      );
    },
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    setNodeResult: (state, action: PayloadAction<{ id: string; result: INodeResult }>) => {
      const { id, result } = action.payload;
      state.nodeResults[id] = result;
    },
    clearNodeResults: (state) => {
      state.nodeResults = {};
    },
    setExecutionStatus: (state, action: PayloadAction<WorkflowStatus>) => {
      state.executionStatus = action.payload;
    },
  },
});

export const {
  setSelectedNode,
  addNode,
  updateNode,
  removeNode,
  setNodes,
  setEdges,
  setNodeResult,
  clearNodeResults,
  setExecutionStatus,
} = workflowSlice.actions;

export default workflowSlice.reducer;
