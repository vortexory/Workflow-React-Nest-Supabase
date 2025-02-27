import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { useAppSelector } from '../../store/hooks';
import { iconMap, defaultIcon } from '../../lib/icons';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const NodeComponent = memo(({ id, data, isConnectable }: NodeProps) => {
  const nodeResults = useAppSelector((state) => state.workflow.nodeResults);
  const nodeResult = nodeResults ? nodeResults[id] : undefined;
  const Icon = data.icon ? iconMap[data.icon] || defaultIcon : defaultIcon;
  const isIfNode = data.type === 'transform/if' || data.id === 'transform/if';

  const getNodeStyle = () => {
    const baseStyle = {
      borderWidth: '2px',
      borderStyle: 'solid',
    };

    if (!nodeResult) return { ...baseStyle, borderColor: '#e2e8f0' };
    
    switch (nodeResult.status) {
      case 'completed':
        return { ...baseStyle, borderColor: '#22c55e' };
      case 'failed':
        return { ...baseStyle, borderColor: '#ef4444' };
      case 'running':
        return { ...baseStyle, borderColor: '#3b82f6' };
      default:
        return { ...baseStyle, borderColor: '#e2e8f0' };
    }
  };

  return (
    <div 
      className="relative flex flex-col items-center justify-center gap-2 p-2 bg-white rounded shadow-sm h-24 w-24" 
      style={getNodeStyle()}
    >
      {/* Main Icon - Show Loader2 when running */}
      {nodeResult?.status === 'running' ? (
        <Loader2 
          size={40} 
          className="animate-spin"
          style={{ color: data.color || '#64748b' }} 
        />
      ) : (
        <Icon 
          size={40} 
          style={{ color: data.color || '#64748b' }} 
        />
      )}
      
      <span className="text-xs text-center font-medium truncate w-full">
        {data.displayName || data.type}
      </span>

      {/* Status Icon - Shows check mark when completed */}
      {nodeResult?.status === 'completed' && (
        <div className="absolute -bottom-2 -right-2">
          <CheckCircle2 className="text-green-500" size={16} />
        </div>
      )}

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