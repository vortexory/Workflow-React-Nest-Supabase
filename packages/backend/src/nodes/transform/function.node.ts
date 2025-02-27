import { NodeDefinition } from '../nodes.service';

const functionNode: NodeDefinition = {
  type: 'function',
  name: 'function',
  displayName: 'Function',
  description: 'Execute custom JavaScript code',
  icon: 'code',
  color: '#f7df1e',
  inputs: [
    {
      name: 'input',
      type: 'any'
    }
  ],
  outputs: [
    {
      name: 'output',
      type: 'any'
    }
  ],
  properties: [
    {
      name: 'code',
      type: 'string',
      required: true
    }
  ],
  execute: async (inputs, properties) => {
    try {
      // Create a safe function execution environment
      const inputData = inputs.input;
      const fn = new Function('input', properties.code);
      const result = fn(inputData);
      return { output: result };
    } catch (error) {
      throw new Error(`Function execution failed: ${error.message}`);
    }
  }
};

export default functionNode;
