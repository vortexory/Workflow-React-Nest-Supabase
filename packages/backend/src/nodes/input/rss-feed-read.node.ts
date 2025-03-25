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
  execute: async (data) => {
    const parser = new Parser();
    const limit = data.settings?.limit || 10;

    // Create an array to store the results for each input
    const results = [];

    // Iterate over each input in the data.input array
    for (let i = 0; i < data.input.length; i++) {
      const input = data.input[i];
      
      // Extract the URL from the current input
      const url = input.json.url;

      // Parse the feed for the current URL
      const feed = await parser.parseURL(url);

      // Slice the feed items and map them
      const feeds = feed.items.slice(0, limit).map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.content,
      }));

      // Add the result with the "input arrangement number"
      results.push({
        inputIndex: i,  // This is the "arrangement number" (index)
        feeds,
      });
    }

    // Return the results with the success status
    return { success: true, output: results };
  },

};

export default rssFeedReadNode;
