import { NodeDefinition } from '../nodes.service';

const mergeDataNode: NodeDefinition = {
  type: 'mergeData',
  displayName: 'Merge Data',
  description: 'Merge multiple inputs into a single output',
  icon: 'git-merge',
  color: '#ff922b',
  inputs: [
    {
      name: 'input1',
      type: 'any',
      required: true
    },
    {
      name: 'input2',
      type: 'any',
      required: true
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
      name: 'mergeType',
      type: 'string',
      required: true,
      default: 'combine' // combine, overwrite
    }
  ],
  execute: async (inputs, properties) => {
    const { input1, input2 } = inputs;
    const { mergeType } = properties;

    if (mergeType === 'combine') {
      if (Array.isArray(input1) && Array.isArray(input2)) {
        return { output: [...input1, ...input2] };
      } else if (typeof input1 === 'object' && typeof input2 === 'object') {
        return { output: { ...input1, ...input2 } };
      }
    }

    // For overwrite or simple values
    return { output: input2 };
  }
};

export default mergeDataNode;
