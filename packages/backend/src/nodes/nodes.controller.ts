import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NodesService, NodeDefinition } from './nodes.service';
import functionNode from './transform/function.node';
import splitInBatchesNode from './organization/split-in-batches.node';
import rssFeedReadNode from './input/rss-feed-read.node';
import ifNode from './transform/If.node';
import mergeDataNode from './transform/merge-data.node';
import { nodeDatabase } from './node-database';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  findAll(): Promise<NodeDefinition[]> {
    return this.nodesService.findAll();
  }

  @Get(':type')
  findOne(@Param('type') type: string): Promise<NodeDefinition> {
    return this.nodesService.findOne(type);
  }
  @Post('transform/function')
  transform(@Body() FunctionNode: any): any {
    const inputs = FunctionNode.inputs;
    const properties = FunctionNode.properties;
    return functionNode.execute(inputs, properties);
  }
  @Post('organization/split-in-batches')
  splitInBatches(@Body() Snode: any): any {
    const inputs = Snode.inputs;
    const properties = Snode.properties;
    return splitInBatchesNode.execute(inputs, properties);
  }
  @Post('input/rss-feed-read')
  rssFeedRead(@Body() rssNode: any): any {
    const inputs = rssNode.inputs;
    const properties = rssNode.properties;
    return rssFeedReadNode.execute(inputs, properties);
  }
  @Post('transform/If')
  If(@Body() IfNode: any): any {
    const inputs = IfNode.inputs;
    console.log(inputs);
    const properties = IfNode.properties;
    return ifNode.execute(inputs, properties);
  }
  @Post('transform/merge')
  async merge(@Body() mergeNode: any): Promise<any> {
    try {
      // Validate mergeNode structure
      if (!mergeNode || typeof mergeNode !== 'object') {
        throw new Error('Invalid request body. Expected an object with "inputs" and "properties".');
      }

      const { inputs, properties } = mergeNode;

      // Validate inputs and properties
      if (!inputs || !Array.isArray(inputs)) {
        throw new Error('Invalid "inputs". It must be a non-empty array.');
      }
      if (!properties || typeof properties !== 'object') {
        throw new Error('Invalid "properties". It must be an object.');
      }

      // Execute the mergeDataNode logic
      const result = await mergeDataNode.execute({ inputs }, properties);

      // Return the result
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      // Handle errors and return a meaningful response
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('executeNode')
  async executeNode(@Body() data: any): Promise<any> {
    try {
      const { type } = data;
      if (!type || typeof type !== 'string') {
        throw new Error('Invalid request body. Expected an object with a "type" property.');
      }
      if (!nodeDatabase[type]) {
        throw new Error(`No executor found for node type: ${type}`);
      }

      const result = await nodeDatabase[type].execute(data);
      return {
        success: true,
        result,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
