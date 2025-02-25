import { NodeDefinition } from '../nodes.service';

const textTransformNode: NodeDefinition = {
  type: 'textTransform',
  displayName: 'Text Transform',
  description: 'Transform text using various operations',
  icon: 'type',
  color: '#4CAF50',
  inputs: [
    {
      name: 'text',
      type: 'string',
      required: true
    }
  ],
  outputs: [
    {
      name: 'result',
      type: 'string'
    }
  ],
  properties: [
    {
      name: 'operation',
      type: 'string',
      required: true,
      default: 'uppercase'
    }
  ],
  execute: async (inputs, properties) => {
    const { text } = inputs;
    const { operation } = properties;

    switch (operation.toLowerCase()) {
      case 'uppercase':
        return { result: text.toUpperCase() };
      case 'lowercase':
        return { result: text.toLowerCase() };
      case 'capitalize':
        return { result: text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() };
      case 'reverse':
        return { result: text.split('').reverse().join('') };
      default:
        return { result: text };
    }
  }
};

export default textTransformNode;
