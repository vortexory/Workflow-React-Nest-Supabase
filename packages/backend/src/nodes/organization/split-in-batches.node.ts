import { NodeDefinition } from '../nodes.service';
interface Context{
  currentIndex: number;
  noItemsLeft: boolean;
}

// Sample context object


const splitInBatchesNode: NodeDefinition = {
  type: 'splitInBatches',
  name: 'splitInBatches',
  displayName: 'Split in Batches',
  description: 'Split input data into batches',
  icon: 'split',
  color: '#00875a',
  inputs: [
    {
      name: 'items',
      type: 'array',
      required: true
    }
  ],
  outputs: [
    {
      name: 'batch',
      type: 'array'
    }
  ],
  properties: [
    {
      name: 'batchSize',
      type: 'number',
      required: true,
      default: 10
    }
  ],
  execute: async (data : any) => {
    console.log("Executing Split in Batches Node:", data);

    const batchSize = data.settings?.batchSize || 10;
    const input = data.input || []; // Input array
    const context: Context = data.context || { currentIndex: 0, noItemsLeft: false }; // Initialize context if not provided
    await console.log("SplitInput", input);
    if (!Array.isArray(input)) {
      throw new Error("Input must be an array for Split in Batches Node");
    }

    // Get the current batch based on the currentIndex
    const batch = input.slice(context.currentIndex, context.currentIndex + batchSize);

    // Check if this is the last batch
    const noItemsLeft = context.currentIndex + batchSize >= input.length;
   

    // Update context
    const updatedContext: Context = {
      currentIndex: context.currentIndex + batchSize,
      noItemsLeft,
    };

    console.log("Batch:", batch);
    console.log("Updated Context:", updatedContext);

    return {
      success: true,
      output: batch, // Current batch
      context: updatedContext, // Updated context
    };
  },
};

export default splitInBatchesNode;