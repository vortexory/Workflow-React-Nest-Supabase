export enum NodeCategory {
  TRIGGER = 'trigger',
  INPUT = 'input',
  TRANSFORM = 'transform',
  OUTPUT = 'output',
}

export interface INodeTypeOptions {
  type: string;
  name: string;
  description: string;
  version: number;
  defaults: {
    name: string;
    [key: string]: any;
  };
  inputs: string[];
  outputs: string[];
  properties: INodeProperty[];
  credentials?: INodeCredential[];
}

export interface INodeProperty {
  displayName: string;
  name: string;
  type: string;
  default?: any;
  description?: string;
  required?: boolean;
  options?: INodePropertyOption[];
}

export interface INodePropertyOption {
  name: string;
  value: string | number | boolean;
  description?: string;
}

export interface INodeCredential {
  name: string;
  required: boolean;
  displayName?: string;
  description?: string;
}

export function NodeType(options: INodeTypeOptions): ClassDecorator {
  return function (target: any) {
    // Store metadata on the class
    Reflect.defineMetadata('nodeType', options, target);

    // Add static property to access the options
    target.getNodeType = function(): INodeTypeOptions {
      return options;
    };

    return target;
  };
}