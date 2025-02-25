import { Module } from '@nestjs/common';
import { NodesService } from './nodes.service';
import { NodesController } from './nodes.controller';

@Module({
  controllers: [NodesController],
  providers: [NodesService],
  exports: [NodesService]
})
export class NodesModule {}
