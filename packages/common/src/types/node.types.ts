export interface INodeType {
  type: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  inputs: INodeConnection[];
  outputs: INodeConnection[];
  properties: INodeProperty[];
}

export interface INodeConnection {
  type: 'main' | 'boolean';
  displayName?: string;
}

export interface INodeProperty {
  displayName: string;
  name: string;
  type: PropertyType;
  default?: any;
  required?: boolean;
  options?: IPropertyOption[];
  description?: string;
  placeholder?: string;
}

export type PropertyType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'json'
  | 'code'
  | 'filter';

export interface IPropertyOption {
  name: string;
  value: string | number | boolean;
  description?: string;
}

export interface INodeData {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    name: string;
    settings: Record<string, any>;
    [key: string]: any;
  };
}