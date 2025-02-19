import { create } from 'zustand';
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
  setSelectedNode: (node: Node | null) => void;
  addNode: (node: Node) => void;
  updateNode: (nodeId: string, data: any) => void;
  removeNode: (nodeId: string) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  setNodeResult: (id: string, result: INodeResult) => void;
  clearNodeResults: () => void;
  executeWorkflow: () => Promise<void>;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  executionStatus: 'pending',
  nodeResults: {},

  setSelectedNode: (node) => set({ selectedNode: node }),

  addNode: (node: Node) => {
    set((state) => ({
      ...state,
      nodes: [...state.nodes, node],
    }));
  },

  updateNode: (nodeId: string, data: any) => {
    set((state) => ({
      ...state,
      nodes: state.nodes.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node
      ),
    }));
  },

  removeNode: (nodeId: string) => {
    set((state) => ({
      ...state,
      nodes: state.nodes.filter((node) => node.id !== nodeId),
      edges: state.edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    }));
  },

  setNodes: (nodes: Node[]) => set({ nodes }),
  
  setEdges: (edges: Edge[]) => set({ edges }),

  setNodeResult: (id: string, result: INodeResult) =>
    set((state) => ({
      ...state,
      nodeResults: {
        ...state.nodeResults,
        [id]: result,
      },
    })),

  clearNodeResults: () => set({ nodeResults: {} }),

  executeWorkflow: async () => {
    set({ executionStatus: 'running' });
    try {
      // TODO: Implement workflow execution
      set({ executionStatus: 'completed' });
    } catch (error) {
      set({ executionStatus: 'failed' });
      console.error('Failed to execute workflow:', error);
    }
  },
}));