import { NodeDefinition } from '../nodes.service';
import * as vm from 'vm';
interface Context{
  currentIndex: number;
  noItemsLeft: boolean;
}

const ifNode: NodeDefinition = {
  type: 'if',
  name: 'if',
  displayName: 'IF',
  description: 'Conditional branching based on input',
  icon: 'git-branch',
  color: '#40c057',
  inputs: [
    {
      name: 'value',
      type: 'any',
      required: true
    }
  ],
  outputs: [
    {
      name: 'true',
      type: 'any'
    },
    {
      name: 'false',
      type: 'any'
    }
  ],
  properties: [
    {
      name: 'condition',
      type: 'string',
      required: true,
      default: 'input === true'
    }
  ],
  execute: async (data) => {
    console.log("Executing IF Node:", data);

    // Get condition and input from data
    const condition = data.settings?.condition || "false"; // Default to "false" if not provided
    const input = data.input || []; // Assume input is an array

    if (!condition || typeof condition !== "string") {
      throw new Error("Invalid or missing condition for IF Node.");
    }

    // Context initialization for handling evaluation state
    const context: Context = data.context || { currentIndex: 0, noItemsLeft: true };

    // Extract the current input item based on context
    const currentItem = input[context.currentIndex];

    // Guard against out-of-bound errors
    if (!currentItem) {
      return {
        success: true,
        output: null,
        context: { ...context, noItemsLeft: true }, // Update context to signal completion
      };
    }

    // Prepare sandbox for condition evaluation
    const sandbox = { input: currentItem, result: false, console };
    const vmContext = vm.createContext(sandbox);

    try {
      // Execute the condition in the sandbox
      vm.runInContext(`result = (${condition});`, vmContext);

      // Prepare the updated context
      const updatedContext: Context = {
        currentIndex: context.currentIndex + 1,
        noItemsLeft: context.currentIndex + 1 >= input.length,
      };

      console.log("Condition Evaluation Result:", sandbox.result);
      console.log("Updated Context:", updatedContext);

      // Return based on condition evaluation
      if (sandbox.result) {
        return { success: true, output: currentItem, context: updatedContext };
      } else {
        return { success: true, output: null, context: updatedContext };
      }
    } catch (error) {
      return { success: false, error: `Error evaluating condition: ${error.message}` };
    }
  },
};


export default ifNode;
