import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWorkflows } from '../lib/api';
import { IWorkflow } from '@workflow-automation/common';

export default function WorkflowList() {
  const [workflows, setWorkflows] = useState<IWorkflow[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      const data = await getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Workflows</h1>
        <button
          onClick={() => navigate('/editor')}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
        >
          Create New
        </button>
      </div>

      <div className="grid gap-4">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            onClick={() => navigate(`/editor/${workflow.id}`)}
            className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/50 cursor-pointer bg-background"
          >
            <div>
              <h2 className="font-medium">{workflow.name}</h2>
              <p className="text-sm text-muted-foreground">
                Created {new Date(workflow.createdAt!).toLocaleDateString()}
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {workflow.nodes.length} nodes
            </div>
          </div>
        ))}
        {workflows.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No workflows yet. Create your first one!
          </div>
        )}
      </div>
    </div>
  );
}
