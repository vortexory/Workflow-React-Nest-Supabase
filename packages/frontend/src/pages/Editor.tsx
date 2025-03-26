import { useCallback, useState, useRef, useEffect } from "react";
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
} from "reactflow";
import { NodeComponent } from "../components/nodes/NodeComponent";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setNodes,
  setEdges,
  setExecutionStatus,
  setNodeResults,
  setActiveNodeId,
  resetExecution,
} from "../store/workflowSlice";
import { NodeList } from "../components/NodeList";
import { NodeSettings } from "../components/NodeSettings";
import {
  PlayIcon,
  AlertCircle,
  Save,
  ArrowLeft,
  StopCircle,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  saveWorkflow,
  executeWorkflow,
  getWorkflow,
  stopWorkflow,
} from "../lib/api";
import {
  INodeData,
  INodeType,
  WorkflowStatus,
} from "@workflow-automation/common";
import { IWorkflow, IEdge } from "@workflow-automation/common";
import { useParams, useNavigate } from "react-router-dom";
import { WorkflowNameDialog } from "../components/WorkflowNameDialog";
import "./style.css";
import LogScreen from "../components/ui/log";
const nodeTypes = {
  default: NodeComponent,
};

const getEdgeStyle = (sourceHandle: string | null) => {
  if (sourceHandle === "true") {
    return {
      type: "smoothstep",
      animated: true,
      style: { stroke: "#22c55e", strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#22c55e",
      },
    };
  }
  if (sourceHandle === "false") {
    return {
      type: "smoothstep",
      animated: true,
      style: { stroke: "#ef4444", strokeWidth: 1.5 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#ef4444",
      },
    };
  }
  return {
    type: "smoothstep",
    animated: true,
    style: { stroke: "#64748b", strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
      color: "#64748b",
    },
  };
};

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL ?? "",
  import.meta.env.VITE_SUPABASE_KEY ?? ""
);

export default function Editor() {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const { nodes, edges, executionStatus } = useAppSelector(
    (state) => state.workflow
  );
  const [selectedNode, setSelectedNode] = useState<Node<INodeType> | null>(
    null
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadWorkflow(id);
    } else {
      // Clear state when creating new workflow
      setWorkflowId(null);
      setWorkflowName("My Workflow");
      dispatch(setNodes([]));
      dispatch(setEdges([]));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (!workflowId) return;

    const channel = supabase
      .channel(`workflow-executions`)
      .on(
        "postgres_changes" as any,
        {
          event: "*",
          schema: "public",
          table: "workflow_executions",
          filter: `workflow_id=eq.${workflowId}`,
        },
        (payload: {
          new: {
            workflow_id: string;
            status: WorkflowStatus;
            node_results: Record<string, any>;
          } | null;
        }) => {
          console.log("*** Payload ***", payload);
          if (payload.new) {
            dispatch(setExecutionStatus(payload.new.status));
            dispatch(setNodeResults(payload.new.node_results));
            dispatch(setActiveNodeId(payload.new.node_results["activeNodeId"]));
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
      console.error("Error loading workflow:", error);
      navigate("/");
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

  const onNodeClick: NodeMouseHandler = useCallback(
    (_: React.MouseEvent, node: Node<INodeType>) => {
      console.log("Selected Node:", node);
      setSelectedNode(node);
      setSettingsOpen(true);
    },
    []
  );

  const onSettingsChange = useCallback(
    (nodeId: string, settings: Record<string, any>) => {
      dispatch(
        setNodes(
          nodes.map((node) =>
            node.id === nodeId
              ? { ...node, data: { ...node.data, settings } }
              : node
          )
        )
      );
    },
    [nodes, dispatch]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      if (!reactFlowWrapper.current || !reactFlowInstance) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const nodeData = JSON.parse(
        event.dataTransfer.getData("application/reactflow")
      ) as INodeType;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      const newNode: Node<INodeType> = {
        id: crypto.randomUUID(),
        type: "default",
        position,
        data: nodeData,
      };

      dispatch(setNodes([...nodes, newNode]));
    },
    [nodes, dispatch, reactFlowInstance]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleExecute = useCallback(async () => {
    try {
      dispatch(resetExecution());
      const workflow: IWorkflow = {
        id: workflowId || "temp",
        name: workflowName || "Untitled",
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: {
            name: node.data.name,
            displayName: node.data.displayName,
            icon: node.data?.icon,
            color: node.data?.color,
            type: node.data.type,
            properties: node.data.properties,
            settings: node.data?.settings
              // node.data.properties?.reduce(
              //   (acc, prop) => {
              //     acc[prop.name] = prop.default;
              //     return acc;
              //   },
              //   {} as Record<string, any>
              // ) || {},
          },
        })) as INodeData[],
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      };

      const workResult = await executeWorkflow(workflow);
      await console.log(workResult,"result");
    } catch (error) {
      console.error("Error executing workflow:", error);
    }
  }, [nodes, edges, workflowId, workflowName, dispatch]);

  const handleStopWorkflow = useCallback(async () => {
    try {
      if (!workflowId) return;
      await stopWorkflow(workflowId);
    } catch (error) {
      console.error("Error stopping workflow:", error);
    }
  }, [workflowId]);

  useEffect(() => {
    return () => {
      // Stop workflow execution when leaving the page
      if (workflowId && executionStatus === "running") {
        handleStopWorkflow();
      }
    };
  }, [workflowId, executionStatus, handleStopWorkflow]);

  const handleSaveWorkflow = useCallback(async () => {
    if (nodes.length === 0) return;
    setNameDialogOpen(true);
  }, [nodes]);

  const handleSaveWithName = async (name: string) => {
    try {
      const workflow: Omit<IWorkflow, "id" | "createdAt" | "updatedAt"> = {
        name,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.type || "default",
          position: node.position,
          data: {
            name: node.data.name,
            displayName: node.data.displayName,
            icon: node.data?.icon,
            color: node.data?.color,
            type: node.data.type,
            properties: node.data.properties,
            settings: 
              node.data.properties?.reduce(
                (acc, prop) => {
                  acc[prop.name] = prop.default;
                  return acc;
                },
                {} as Record<string, any>
              ) || {},
          },
        })) as INodeData[],
        edges: edges.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
        })),
      };

      const savedWorkflow = workflowId
        ? await saveWorkflow({ ...workflow, id: workflowId })
        : await saveWorkflow(workflow as IWorkflow);

      setWorkflowId(savedWorkflow.id);
      setWorkflowName(name);
    } catch (error) {
      console.error("Error saving workflow:", error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col">
        <div className="h-[40px] border-b flex items-center px-4 gap-2 relative">
          {executionStatus === "running" ? (
            <button
              onClick={handleStopWorkflow}
              className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1.5 text-sm font-semibold text-destructive-foreground shadow-sm hover:bg-destructive/90"
            >
              <StopCircle size={14} />
              Stop
            </button>
          ) : (
            <button
              onClick={handleExecute}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
              disabled={nodes.length === 0}
            >
              <PlayIcon size={14} />
              Test
            </button>
          )}
          <button
            onClick={handleSaveWorkflow}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
            disabled={nodes.length === 0}
          >
            <Save size={14} />
            Save
          </button>
          {/* Button to toggle the log screen */}

          <div className="absolute top-[20px] left-[calc(50%-90px)] flex justify-center z-[50]">
            <div className="px-2 py-1 bg-[rgb(217,221,231)] rounded-[6px]">
              <button
                className={`rounded-[6px] px-3 py-1 ${visible ? "" : "bg-white"}`}
                onClick={() => setVisible(false)}
              >
                Editor
              </button>
              <button
                className={`rounded-[6px] px-3 py-1 ${visible ? "bg-white" : ""}`}
                onClick={() => setVisible(true)}
              >
                Executions
              </button>
            </div>
          </div>

          <span className="text-sm font-medium ml-2">{workflowName}</span>
          {executionStatus === "failed" && (
            <div className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertCircle size={14} />
              Execution failed
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back to List
          </button>
        </div>
        <div className="flex-1 flex">
          {visible && <LogScreen />}
          <div ref={reactFlowWrapper} className="flex-1"></div>
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
