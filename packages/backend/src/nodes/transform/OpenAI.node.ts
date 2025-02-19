import { BaseNode } from '../base/BaseNode';
import { NodeType } from '../base/NodeType';
import { INodeExecutionData } from '@workflow-automation/common';
import OpenAI from 'openai';

interface OpenAISettings {
  apiKey: string;
  model: string;
  prompt: string;
  temperature: number;
  maxTokens: number;
}

@NodeType({
  type: 'openai',
  name: 'OpenAI',
  description: 'Use OpenAI to generate text',
  version: 1,
  defaults: {
    name: 'OpenAI',
  },
  inputs: ['main'],
  outputs: ['main'],
  credentials: [
    {
      name: 'openAiApi',
      required: true,
    },
  ],
  properties: [
    {
      displayName: 'Model',
      name: 'model',
      type: 'options',
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
      description: 'Controls randomness in the output. Lower values are more focused and deterministic.',
    },
    {
      displayName: 'Max Tokens',
      name: 'maxTokens',
      type: 'number',
      default: 1000,
      description: 'The maximum number of tokens to generate',
    },
  ],
})
export class OpenAINode extends BaseNode {
  private openai: OpenAI;

  async onInit(settings: OpenAISettings): Promise<void> {
    this.openai = new OpenAI({
      apiKey: settings.apiKey,
    });
  }

  async execute(data: INodeExecutionData[]): Promise<INodeExecutionData[]> {
    const settings = this.getSettings() as OpenAISettings;
    
    const results: INodeExecutionData[] = [];

    for (const item of data) {
      try {
        const response = await this.openai.chat.completions.create({
          model: settings.model,
          messages: [
            {
              role: 'user',
              content: this.resolveValue(settings.prompt, item.json),
            },
          ],
          temperature: settings.temperature,
          max_tokens: settings.maxTokens,
        });

        results.push({
          json: {
            ...item.json,
            openAiResponse: response.choices[0].message.content,
          },
        });
      } catch (error) {
        console.error('OpenAI API Error:', error);
        throw error;
      }
    }

    return results;
  }

  private resolveValue(value: string, item: any): string {
    return value.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      const path = key.trim().split('.');
      let current = item;
      for (const segment of path) {
        if (current === undefined) return match;
        current = current[segment];
      }
      return current !== undefined ? current.toString() : match;
    });
  }
}