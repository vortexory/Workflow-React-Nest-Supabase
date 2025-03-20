import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { NodesService, NodeDefinition } from './nodes.service';
import  functionNode  from './transform/function.node';

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
  transform(@Body() Fnode: any): any {
    const inputs = Fnode.inputs;
    const properties = Fnode.properties;
    return functionNode.execute(inputs, properties);
  }
 
}
