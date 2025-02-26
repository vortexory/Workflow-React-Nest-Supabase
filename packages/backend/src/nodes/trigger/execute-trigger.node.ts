import { NodeDefinition } from '../nodes.service';

const executeTriggerNode: NodeDefinition = {
  type: 'executeTrigger',
  displayName: 'On clicking execute',
  description: 'Triggers when the workflow execution button is clicked',
  icon: 'play',
  color: '#ff6b6b',
  inputs: [],
  outputs: [
    {
      name: 'trigger',
      type: 'boolean'
    }
  ],
  properties: [],
  execute: async () => {
    return {
      trigger: true
    };
  }
};

export default executeTriggerNode;
