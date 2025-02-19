import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodeFactory } from './base/NodeFactory';
import { NodesController } from './nodes.controller';

@Module({
  controllers: [NodesController],
  providers: [NodesService, NodeFactory],
  exports: [NodesService, NodeFactory],
})
export class NodesModule {}
