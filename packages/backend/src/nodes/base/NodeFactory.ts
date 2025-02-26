import { Injectable } from '@nestjs/common';
import { NodesService } from '../nodes.service';
import { INodeExecutionData } from '@workflow-automation/common';

interface NodeInstance {
  onInit: (settings: Record<string, any>) => Promise<void>;
  execute: (data: INodeExecutionData[]) => Promise<INodeExecutionData[]>;
}

@Injectable()
export class NodeFactory {
  constructor(private readonly nodesService: NodesService) {}

  async createNode(type: string): Promise<NodeInstance> {
    const nodeDefinition = await this.nodesService.findOne(type);
    let nodeSettings: Record<string, any> = {};

    return {
      onInit: async (settings: Record<string, any>) => {
        nodeSettings = settings;
      },
      execute: async (data: INodeExecutionData[]) => {
        if (!nodeDefinition.execute) {
          throw new Error(`Node type ${type} does not have an execute function`);
        }

        // Convert input data to match node input names
        const inputs: Record<string, any> = {};
        
        // For nodes with single input, use the first item
        if (nodeDefinition.inputs.length === 1) {
          const inputName = nodeDefinition.inputs[0].name;
          inputs[inputName] = data[0]?.json;
        } 
        // For nodes with multiple inputs, map each input
        else if (nodeDefinition.inputs.length > 1) {
          nodeDefinition.inputs.forEach((input, index) => {
            inputs[input.name] = data[index]?.json;
          });
        }

        // Execute node with converted inputs
        const result = await nodeDefinition.execute(inputs, nodeSettings);

        // Convert result to INodeExecutionData format
        return [{
          json: result
        }];
      }
    };
  }
}
