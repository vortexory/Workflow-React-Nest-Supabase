import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, AlertCircle, StopCircle } from 'lucide-react';
import { getWorkflowExecutions } from '../lib/api';

interface Execution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'stopped';
  nodeResults: Record<string, any>;
  createdAt: string;
}

export default function Executions() {
  const { id } = useParams();
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    if (!id) return;
    loadExecutions();
  }, [id]);

  const loadExecutions = async () => {
    try {
      const data = await getWorkflowExecutions(id!);
      setExecutions(data);
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="text-green-500" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      case 'running':
        return <AlertCircle className="text-blue-500" size={16} />;
      case 'stopped':
        return <StopCircle className="text-orange-500" size={16} />;
      default:
        return null;
    }
  };

  const getDuration = (execution: Execution) => {
    if (!execution.nodeResults?.duration) return '-';
    return `${(execution.nodeResults.duration / 1000).toFixed(3)}s`;
  };

  return (
    <div className="flex h-screen">
      {/* Left sidebar with execution history */}
      <div className="w-64 border-r bg-muted/10">
        <div className="p-4 border-b">
          <h2 className="text-sm font-medium">Execution History</h2>
        </div>
        <div className="overflow-auto h-[calc(100vh-57px)]">
          {executions.map((execution) => (
            <div
              key={execution.id}
              className="p-4 border-b hover:bg-muted/20 cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-1">
                {getStatusIcon(execution.status)}
                <span className="text-sm font-medium capitalize">
                  {execution.status}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {format(new Date(execution.createdAt), 'MMM d, HH:mm:ss')}
              </div>
              <div className="text-xs text-muted-foreground">
                Duration: {getDuration(execution)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - blank for now */}
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Select an execution to view details
      </div>
    </div>
  );
}
