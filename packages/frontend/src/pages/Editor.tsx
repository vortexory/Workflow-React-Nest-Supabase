import { useCallback, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  Connection,
  BackgroundVariant,
  Node,
  NodeMouseHandler,
  addEdge,
  ReactFlowInstance,
  MarkerType,
} from 'reactflow';
import { NodeComponent } from '../components/nodes/NodeComponent';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setNodes, setEdges, setExecutionStatus } from '../store/workflowSlice';
import { NodeList } from '../components/NodeList';
import { NodeSettings } from '../components/NodeSettings';
import { PlayIcon, AlertCircle, Save } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { saveWorkflow, executeWorkflow, getWorkflow } from '../lib/api';
import { INodeData, INodeType, WorkflowStatus } from '@workflow-automation/common';
import { IWorkflow, IEdge } from '@workflow-automation/common';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkflowNameDialog } from '../components/WorkflowNameDialog';
import "./style.css";

const nodeTypes = {
  default: NodeComponent,
};

const getEdgeStyle = (sourceHandle: string | null) => {
  if (sourceHandle === 'true') {
    return {
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#22c55e', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#22c55e',
      },
    };
  }
  if (sourceHandle === 'false') {
    return {
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#ef4444', strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#ef4444',
      },
    };
  }
  return {
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#64748b', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: '#64748b',
    },
  };
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_KEY ?? ""
);

export default function Editor() {
  const dispatch = useAppDispatch();
  const { nodes, edges, executionStatus } = useAppSelector((state) => state.workflow);
  const [selectedNode, setSelectedNode] = useState<Node<INodeType> | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState('My Workflow');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    }
  }, [id]);

  useEffect(() => {
    if (!workflowId) return;
    const channel = supabase
      .channel('workflow-executions')
      .on<{ workflowId: string; status: WorkflowStatus }>(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'workflow_executions',
          filter: `workflowId=eq.${workflowId}`,
        },
        (payload: { new: { workflowId: string; status: WorkflowStatus } | null }) => {
          if (payload.new) {
            dispatch(setExecutionStatus(payload.new.status));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workflowId, dispatch]);

  const loadWorkflow = async (workflowId: string) => {
    try {
      const workflow = await getWorkflow(workflowId);
      setWorkflowId(workflow.id);
      setWorkflowName(workflow.name);
      
      // Add edge styles to loaded edges
      const edgesWithStyle = workflow.edges.map((edge: IEdge) => ({
        ...edge,
        ...getEdgeStyle(edge?.sourceHandle ?? null),
      }));
      
      dispatch(setNodes(workflow.nodes));
      dispatch(setEdges(edgesWithStyle));
    } catch (error) {
      console.error('Error loading workflow:', error);
      navigate('/');
    }
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      dispatch(setNodes(applyNodeChanges(changes, nodes)));
    },
    [nodes, dispatch]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      dispatch(setEdges(applyEdgeChanges(changes, edges)));
    },
    [edges, dispatch]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        ...connection,
        ...getEdgeStyle(connection.sourceHandle),
      };
      dispatch(setEdges(addEdge(edge, edges)));
    },
    [edges, dispatch]
  );

  const onNodeClick: NodeMouseHandler = useCallback((_: React.MouseEvent, node: Node<INodeType>) => {
    setSelectedNode(node);
    setSettingsOpen(true);
  }, []);

  const onSettingsChange = useCallback((nodeId: string, settings: Record<string, any>) => {
    dispatch(setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, settings } } : node))));
  }, [nodes, dispatch]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeData = JSON.parse(event.dataTransfer.getData('application/reactflow')) as INodeType;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<INodeType> = {
        id: crypto.randomUUID(),
        type: 'default',
        position,
        data: nodeData,
      };

      dispatch(setNodes([...nodes, newNode]));
    },
    [nodes, dispatch, reactFlowInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const handleExecuteWorkflow = useCallback(async () => {
    if (!workflowId || nodes.length === 0) return;

    dispatch(setExecutionStatus('running'));
    try {
      await executeWorkflow(workflowId);
      dispatch(setExecutionStatus('completed'));
    } catch (error) {
      dispatch(setExecutionStatus('failed'));
      console.error('Failed to execute workflow:', error);
    }
  }, [nodes, dispatch, workflowId]);

  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;
    setNameDialogOpen(true);
  }, [nodes]);

  const handleSaveWithName = async (name: string) => {
    try {
      const workflow: Omit<IWorkflow, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: node.data,
        })) as INodeData[],
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
          type: edge.type,
          animated: edge.animated,
          style: edge.style,
          markerEnd: edge.markerEnd,
        })) as IEdge[],
      };

      const savedWorkflow = workflowId 
        ? await saveWorkflow({ ...workflow, id: workflowId })
        : await saveWorkflow(workflow as IWorkflow);

      setWorkflowId(savedWorkflow.id);
      setWorkflowName(name);
      console.log('Workflow saved successfully');
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="h-12 border-b flex items-center px-4 gap-2">
          <button
            onClick={handleExecuteWorkflow}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            disabled={nodes.length === 0 || executionStatus === 'running'}
          >
            <PlayIcon size={14} />
            Test
          </button>
          <button
            onClick={handleSaveWorkflow}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            disabled={nodes.length === 0}
          >
            <Save size={14} />
            Save
          </button>
          <span className="text-sm font-medium">{workflowName}</span>
          {executionStatus === 'failed' && (
            <div className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={14} />
              Execution failed
            </div>
          )}
        </div>
        <div ref={reactFlowWrapper} className="flex-1 h-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
          >
            <Controls />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>
      <NodeList />
      {selectedNode && (
        <NodeSettings
          node={selectedNode}
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onChange={onSettingsChange}
        />
      )}
      <WorkflowNameDialog
        isOpen={nameDialogOpen}
        onClose={() => setNameDialogOpen(false)}
        onSave={handleSaveWithName}
        initialName={workflowName}
      />
    </div>
  );
}