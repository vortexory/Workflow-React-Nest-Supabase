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
      required: true,
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
      default: 'return input;',
      required: true,
    },
  ],
  execute: async (data) => {
    console.log("Executing Function Node:", data);
    // Simulate function execution
    if (!data.settings?.code) {
      throw new Error("No code provided for Function Node");
    }
    const input = data.input || {};
    const sandbox = {input, result:null, console} 
    const code = data.settings.code;
   const context = vm.createContext(sandbox) 
    try {
     new Function(code);
     vm.runInContext(code, context);   
     if(sandbox.result){
      return { success: true, output: sandbox.result };
       }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}


export default functionNode;
