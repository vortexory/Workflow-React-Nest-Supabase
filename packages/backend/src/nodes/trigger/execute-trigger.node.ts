import { NodeDefinition } from '../nodes.service';

// Define the node
const executeTriggerNode: NodeDefinition = {
  type: 'executeTrigger', // Unique type identifier
  name: 'executeTrigger', // Internal node name
  displayName: 'On Clicking Execute', // User-friendly name shown in the UI
  description: 'Triggers when the workflow execution button is clicked', // Detailed explanation of the node's purpose
  icon: 'play', // Icon representing the node
  color: '#ff6b6b', // Node color in the UI
  inputs: [], // No inputs as this is a trigger node
  outputs: [
    {
      name: 'trigger', // Output name
      type: 'boolean', // Data type for the output
    },
  ],
  properties: [
    {    
      name: 'triggerEnabled',
      type: 'boolean',
      default: true,
    },
  ], // Add any additional properties if required
  execute: async (context) => {
    // Optional context for accessing runtime info, if your platform supports it
    const isTriggerEnabled = context?.parameters?.triggerEnabled ?? true;

    // Return the trigger output
    if (isTriggerEnabled) {
      return {
        trigger: true, // Indicate the trigger is active
      };
    } else {
      return {
        trigger: false, // Indicate the trigger is disabled
      };
    }
  },
};

export default executeTriggerNode;