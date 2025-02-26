import { Injectable } from '@nestjs/common';
import { BaseNode } from './BaseNode';

@Injectable()
export class NodeFactory {
  private nodeTypes: { [key: string]: new () => BaseNode } = {
  };

  registerNodeType(type: string, nodeClass: new () => BaseNode): void {
    this.nodeTypes[type] = nodeClass;
  }

  createNode(type: string): BaseNode {
    const NodeClass = this.nodeTypes[type];
    if (!NodeClass) {
      throw new Error(`Node type '${type}' not found`);
    }
    return new NodeClass();
  }

  getAvailableNodeTypes(): string[] {
    return Object.keys(this.nodeTypes);
  }
}