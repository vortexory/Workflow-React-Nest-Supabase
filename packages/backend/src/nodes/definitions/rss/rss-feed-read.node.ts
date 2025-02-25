import { NodeDefinition } from '../../nodes.service';
import Parser from 'rss-parser';

const rssFeedReadNode: NodeDefinition = {
  type: 'rssFeedRead',
  displayName: 'RSS Feed Read',
  description: 'Read items from an RSS feed',
  icon: 'rss',
  color: '#ff8533',
  inputs: [
    {
      name: 'url',
      type: 'string',
      required: true
    }
  ],
  outputs: [
    {
      name: 'items',
      type: 'array'
    }
  ],
  properties: [
    {
      name: 'limit',
      type: 'number',
      default: 10
    }
  ],
  execute: async (inputs, properties) => {
    const parser = new Parser();
    const { url } = inputs;
    const { limit } = properties;

    try {
      const feed = await parser.parseURL(url);
      const items = feed.items.slice(0, limit);
      return { items };
    } catch (error) {
      throw new Error(`Failed to read RSS feed: ${error.message}`);
    }
  }
};

export default rssFeedReadNode;
