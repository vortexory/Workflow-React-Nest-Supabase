import { Injectable } from '@nestjs/common';
import { INodeType, INodeConnection, INodeProperty } from '@workflow-automation/common';
import { NodeCategory } from './base/NodeType';

@Injectable()
export class NodesService {
  getAvailableNodes(): INodeType[] {
    return [
      {
        type: 'manualTrigger',
        displayName: 'Manual Trigger',
        description: 'Manually trigger a workflow',
        icon: 'play',
        color: '#4CAF50',
        inputs: [],
        outputs: [
          {
            type: 'main',
            displayName: 'Output',
          },
        ],
        properties: [],
      },
      {
        type: 'rssFeed',
        displayName: 'RSS Feed',
        description: 'Fetch data from an RSS feed',
        icon: 'rss_feed',
        color: '#FF9800',
        inputs: [],
        outputs: [
          {
            type: 'main',
            displayName: 'Items',
          },
        ],
        properties: [
          {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            default: '',
            required: true,
            description: 'URL of the RSS feed',
          },
          {
            displayName: 'Max Items',
            name: 'maxItems',
            type: 'number',
            default: 10,
            description: 'Maximum number of items to fetch',
          },
        ],
      },
      {
        type: 'openai',
        displayName: 'OpenAI',
        description: 'Use OpenAI to generate text',
        icon: 'smart_toy',
        color: '#00BCD4',
        inputs: [
          {
            type: 'main',
            displayName: 'Input',
          },
        ],
        outputs: [
          {
            type: 'main',
            displayName: 'Output',
          },
        ],
        properties: [
          {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            default: '',
            required: true,
            description: 'OpenAI API Key',
          },
          {
            displayName: 'Model',
            name: 'model',
            type: 'select',
            options: [
              {
                name: 'GPT-4',
                value: 'gpt-4',
              },
              {
                name: 'GPT-3.5 Turbo',
                value: 'gpt-3.5-turbo',
              },
            ],
            default: 'gpt-3.5-turbo',
            description: 'The OpenAI model to use',
          },
          {
            displayName: 'Prompt',
            name: 'prompt',
            type: 'string',
            default: '',
            description: 'The prompt to send to OpenAI',
          },
          {
            displayName: 'Temperature',
            name: 'temperature',
            type: 'number',
            default: 0.7,
            description: 'Controls randomness in the output',
          },
          {
            displayName: 'Max Tokens',
            name: 'maxTokens',
            type: 'number',
            default: 1000,
            description: 'Maximum number of tokens to generate',
          },
        ],
      },
    ];
  }
}
