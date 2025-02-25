import { NodeDefinition } from '../nodes.service';
import axios from 'axios';

const httpRequestNode: NodeDefinition = {
  type: 'httpRequest',
  displayName: 'HTTP Request',
  description: 'Make HTTP requests to external APIs',
  icon: 'globe',
  color: '#0099ff',
  inputs: [
    {
      name: 'url',
      type: 'string',
      required: true
    },
    {
      name: 'method',
      type: 'string',
      required: true
    },
    {
      name: 'headers',
      type: 'object',
      required: false
    },
    {
      name: 'body',
      type: 'object',
      required: false
    }
  ],
  outputs: [
    {
      name: 'response',
      type: 'object'
    },
    {
      name: 'statusCode',
      type: 'number'
    }
  ],
  properties: [
    {
      name: 'timeout',
      type: 'number',
      default: 5000
    }
  ],
  execute: async (inputs, properties) => {
    try {
      const response = await axios({
        url: inputs.url,
        method: inputs.method,
        headers: inputs.headers,
        data: inputs.body,
        timeout: properties.timeout
      });

      return {
        response: response.data,
        statusCode: response.status
      };
    } catch (error) {
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  }
};

export default httpRequestNode;
