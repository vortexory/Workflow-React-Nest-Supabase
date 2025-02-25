import { NodeDefinition } from '../nodes.service';

const mathOperationNode: NodeDefinition = {
  type: 'mathOperation',
  displayName: 'Math Operation',
  description: 'Perform mathematical operations',
  icon: 'calculator',
  color: '#FF5722',
  inputs: [
    {
      name: 'number1',
      type: 'number',
      required: true
    },
    {
      name: 'number2',
      type: 'number',
      required: true
    }
  ],
  outputs: [
    {
      name: 'result',
      type: 'number'
    }
  ],
  properties: [
    {
      name: 'operation',
      type: 'string',
      required: true,
      default: 'add'
    }
  ],
  execute: async (inputs, properties) => {
    const { number1, number2 } = inputs;
    const { operation } = properties;

    switch (operation.toLowerCase()) {
      case 'add':
        return { result: number1 + number2 };
      case 'subtract':
        return { result: number1 - number2 };
      case 'multiply':
        return { result: number1 * number2 };
      case 'divide':
        if (number2 === 0) {
          throw new Error('Division by zero is not allowed');
        }
        return { result: number1 / number2 };
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
};

export default mathOperationNode;
