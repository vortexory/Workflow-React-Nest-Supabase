import { NodeDefinition } from '../nodes.service';

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
  execute: async (inputs, properties) => {
    const { items } = inputs;
    const { batchSize } = properties;

    // Validate inputs
    if (!Array.isArray(items)) {
      throw new Error('Input "items" must be an array');
    }

    if (typeof batchSize !== 'number' || batchSize <= 0 || !Number.isInteger(batchSize)) {
      throw new Error('Property "batchSize" must be a positive integer');
    }

    // Create batches
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    // Return all batches
    return {
      batch: batches
    };
  }
};

export default splitInBatchesNode;