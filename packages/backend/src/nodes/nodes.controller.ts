import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';

@Controller('nodes')
export class NodesController {
  constructor(private readonly nodesService: NodesService) {}

  @Get()
  findAll() {
    return this.nodesService.findAll();
  }

  @Get(':type')
  findOne(@Param('type') type: string) {
    return this.nodesService.findOne(type);
  }

  @Post()
  create(@Body() createNodeTypeDto: CreateNodeTypeDto) {
    return this.nodesService.create(createNodeTypeDto);
  }

  @Put(':type')
  update(@Param('type') type: string, @Body() updateNodeTypeDto: UpdateNodeTypeDto) {
    return this.nodesService.update(type, updateNodeTypeDto);
  }

  @Delete(':type')
  remove(@Param('type') type: string) {
    return this.nodesService.remove(type);
  }
}
