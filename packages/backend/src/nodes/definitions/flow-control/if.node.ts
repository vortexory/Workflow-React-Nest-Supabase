import { NodeDefinition } from '../../nodes.service';

const ifNode: NodeDefinition = {
  type: 'if',
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
  execute: async (inputs, properties) => {
    const { value } = inputs;
    const { condition } = properties;

    try {
      // Create a safe condition evaluation environment
      const fn = new Function('input', `return ${condition}`);
      const result = fn(value);

      return {
        true: result ? value : null,
        false: !result ? value : null
      };
    } catch (error) {
      throw new Error(`Condition evaluation failed: ${error.message}`);
    }
  }
};

export default ifNode;
