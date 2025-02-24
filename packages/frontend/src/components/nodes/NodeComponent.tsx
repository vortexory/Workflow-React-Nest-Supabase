import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Component } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { nodeIcons } from '../../lib/icons';

export const NodeComponent = memo(({ id, data, isConnectable }: NodeProps) => {
  const nodeResults = useAppSelector((state) => state.workflow.nodeResults);
  const nodeResult = nodeResults[id];
  const Icon = nodeIcons[data.type] || Component;
  // Check both type and id for IF nodes
  const isIfNode = data.type === 'if' || data.id === 'if';

  const getBorderColor = () => {
    if (!nodeResult) return '#e2e8f0';
    switch (nodeResult.status) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'running':
        return '#3b82f6';
      default:
        return '#e2e8f0';
    }
  };

  return (
    <div 
      className="relative flex items-center justify-center gap-2 p-2 bg-white rounded shadow-sm h-20 w-20" 
      style={{ borderColor: getBorderColor(), border: '2px solid' }}
    >
      <Icon size={50} className="text-primary shrink-0" />

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 !bg-primary border-2 border-background"
        isConnectable={isConnectable}
      />

      {/* Output Handles */}
      {isIfNode ? (
        <>
          {/* True output */}
          <Handle
            type="source"
            position={Position.Right}
            id="true"
            className="w-2 h-2 !bg-green-500 border-2 border-background"
            style={{ top: '30%' }}
            isConnectable={isConnectable}
          />
          {/* False output */}
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-2 h-2 !bg-red-500 border-2 border-background"
            style={{ top: '70%' }}
            isConnectable={isConnectable}
          />
          {/* Labels for true/false outputs */}
          <div className="absolute right-0 text-[10px] select-none">
            <div className="absolute right-[-24px] top-[calc(30%-6px)] text-green-600">true</div>
            <div className="absolute right-[-24px] top-[calc(70%-6px)] text-red-600">false</div>
          </div>
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 !bg-primary border-2 border-background"
          isConnectable={isConnectable}
        />
      )}
    </div>
  );
});