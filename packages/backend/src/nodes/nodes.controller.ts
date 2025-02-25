import { Controller, Get, Param } from '@nestjs/common';
import { NodesService, NodeDefinition } from './nodes.service';

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
}
