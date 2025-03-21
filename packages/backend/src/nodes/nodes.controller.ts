import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NodesService, NodeDefinition } from './nodes.service';
import  functionNode  from './transform/function.node';
import splitInBatchesNode from './organization/split-in-batches.node';
import rssFeedReadNode from './input/rss-feed-read.node';
import ifNode from './transform/If.node';
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
 
}
// 
