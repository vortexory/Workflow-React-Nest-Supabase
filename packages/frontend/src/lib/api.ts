import axios from 'axios';
import { IWorkflow } from '@workflow-automation/common';

export const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getNodes = async () => {
  const response = await api.get('/nodes');
  return response.data;
};

export const getWorkflows = async () => {
  const response = await api.get('/workflow');
  return response.data;
};

export const saveWorkflow = async (workflow: IWorkflow) => {
  const response = await api.post('/workflow', workflow);
  return response.data;
};

export const executeWorkflow = async (workflow: IWorkflow) => {
  const response = await api.post('/workflow/execute', workflow);
  return response.data;
};

export const getWorkflow = async (id: string) => {
  const response = await api.get(`/workflow/${id}`);
  return response.data;
};

export const updateWorkflow = async (id: string, workflow: IWorkflow) => {
  const response = await api.put(`/workflow/${id}`, workflow);
  return response.data;
};

export const stopWorkflow = async (workflowId: string) => {
  const response = await api.post(`/workflow/${workflowId}/stop`);
  if (!response.data.success) {
    throw new Error('Failed to stop workflow');
  }
  return response.data;
};

export const getWorkflowExecutions = async (workflowId: string) => {
  const response = await api.get(`/workflow/${workflowId}/executions`);
  return response.data;
};
export const getExecutionLogs = async (workflowId: string) => {
  const response = await api.get(`/workflow/${workflowId}/execution/logs`);
  return response.data;
};
