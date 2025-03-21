import { NodeDefinition } from '../nodes.service';
// Update the import statement for rss-parser
import * as Parser from 'rss-parser';

const rssFeedReadNode: NodeDefinition = {
  type: 'rssFeedRead',
  name: 'rssFeedRead',
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
    // Use the correct way to instantiate the parser
    const parser = new Parser();
    const { url } = inputs;
    const { limit } = properties;

    // Validate input
    if (typeof url !== 'string' || !url.trim().length) {
      throw new Error('Invalid RSS feed URL. Please provide a valid string.');
    }
    try {
      new URL(url); // Validate URL format
    } catch {
      throw new Error('Invalid RSS feed URL format.');
    }

    if (typeof limit !== 'number' || limit <= 0 || !Number.isInteger(limit)) {
      throw new Error('Invalid limit. Please provide a positive integer.');
    }

    try {
      const feed = await parser.parseURL(url);

      if (!feed || !feed.items || feed.items.length === 0) {
        return { items: [] }; // Handle empty feed
      }

      // Extract and normalize items
      const items = feed.items.slice(0, limit).map(item => ({
        title: item.title || '',
        link: item.link || '',
        pubDate: item.pubDate || '',
        description: item.contentSnippet || item.description || '',
        content: item.content || '',
      }));

      return { items };
    } catch (error) {
      if (error.message.includes('404')) {
        throw new Error('RSS feed not found. Please check the URL.');
      }
      throw new Error(`Failed to read RSS feed: ${error.message}`);
    }
  }
};

export default rssFeedReadNode;
