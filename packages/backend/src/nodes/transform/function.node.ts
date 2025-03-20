import { NodeDefinition } from '../nodes.service';
import * as vm from 'vm';

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
      type: 'any',
    },
  ],
  outputs: [
    {
      name: 'output',
      type: 'any',
    },
  ],
  properties: [
    {
      name: 'code',
      type: 'string',
      required: true,
    },
  ],
  execute: async (inputs, properties) => {

    const { code } = properties;
    if (!code) {
      throw new Error('Code is required');
    }

    // Create a sandboxed environment to execute user code safely
    const sandbox = { inputs, result: null, console };
    const context = vm.createContext(sandbox);

    try {
      // Validate the code syntax
      new Function(code);

      // Run the user-provided JavaScript code in the sandboxed environment
      vm.runInContext(code, context);

      // Ensure result is set
      if (sandbox.result === null) {
        throw new Error('Code must set "result" in the sandbox');
      }

      return { success: true, result: sandbox.result };
    } catch (error) {
      // Return the error message if the code execution fails
      return { success: false, error: error.message };
    }
  }
}


export default functionNode;
