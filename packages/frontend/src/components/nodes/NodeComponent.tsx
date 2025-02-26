import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useAppSelector } from '../../store/hooks';
import { iconMap, defaultIcon } from '../../lib/icons';

export const NodeComponent = memo(({ id, data, isConnectable }: NodeProps) => {
  const nodeResults = useAppSelector((state) => state.workflow.nodeResults);
  const nodeResult = nodeResults[id];
  const Icon = data.icon ? iconMap[data.icon] || defaultIcon : defaultIcon;
  // Check both type and id for IF nodes
  const isIfNode = data.type === 'transform/if' || data.id === 'transform/if';

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
      className="relative flex flex-col items-center justify-center gap-2 p-2 bg-white rounded shadow-sm h-24 w-24" 
      style={{ borderColor: getBorderColor(), border: '2px solid' }}
    >
      <Icon 
        size={40} 
        className="shrink-0" 
        style={{ color: data.color || '#64748b' }} 
      />
      <span className="text-xs text-center font-medium truncate w-full">
        {data.displayName || data.type}
      </span>

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
            isConnectable={isConnectable}
            style={{ top: '35%' }}
          />
          {/* False output */}
          <Handle
            type="source"
            position={Position.Right}
            id="false"
            className="w-2 h-2 !bg-red-500 border-2 border-background"
            isConnectable={isConnectable}
            style={{ top: '65%' }}
          />
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