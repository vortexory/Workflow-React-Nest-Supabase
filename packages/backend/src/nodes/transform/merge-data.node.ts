import { NodeDefinition } from '../nodes.service';

const mergeDataNode: NodeDefinition = {
  type: 'mergeData',
  name: 'mergeData',
  displayName: 'Merge Data',
  description: 'Merge multiple inputs into a single output',
  icon: 'git-merge',
  color: '#ff922b',
  inputs: [
    {
      name: 'inputs',
      type: 'array',
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
  execute: async (data) => {
    console.log("Executing Merge Data Node:", data);

    const inputs = data.input || [];
    const properties = data.settings || {};
    const mergeType = properties.mergeType || "combine";

    // Validate inputs
    if (!Array.isArray(inputs) || inputs.length === 0) {
      throw new Error('Input "inputs" must be a non-empty array.');
    }

    // Validate mergeType
    if (!['combine', 'overwrite'].includes(mergeType)) {
      throw new Error('Invalid "mergeType". Allowed values are "combine" or "overwrite".');
    }

    let output;
    if (mergeType === 'combine') {
      if (inputs.every(item => Array.isArray(item))) {
        // Combine arrays
        output = inputs.flat();
      } else if (inputs.every(item => typeof item === 'object' && !Array.isArray(item))) {
        // Combine objects
        output = Object.assign({}, ...inputs);
      } else {
        throw new Error('For "combine", all inputs must be arrays or objects.');
      }
    } else if (mergeType === 'overwrite') {
      // For "overwrite", return the last input
      output = inputs[inputs.length - 1];
    }

    return { success: true, output: output };
  }
};

export default mergeDataNode;
