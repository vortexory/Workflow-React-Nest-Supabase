import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join, resolve } from 'path';

export interface NodeDefinition {
  type: string;
  displayName: string;
  description: string;
  icon?: string;
  color?: string;
  inputs: Array<{
    name: string;
    type: string;
    required?: boolean;
  }>;
  outputs: Array<{
    name: string;
    type: string;
  }>;
  properties: Array<{
    name: string;
    type: string;
    required?: boolean;
    default?: any;
  }>;
  execute?: (inputs: Record<string, any>, properties: Record<string, any>) => Promise<Record<string, any>>;
}

@Injectable()
export class NodesService implements OnModuleInit {
  private readonly logger = new Logger(NodesService.name);
  private nodeDefinitions: Map<string, NodeDefinition> = new Map();
  private readonly nodesDirs: string[];

  constructor() {
    // Check both source and dist directories
    const srcDir = resolve(__dirname, 'definitions');
    const distDir = resolve(__dirname, '..', '..', 'dist', 'nodes', 'definitions');
    this.nodesDirs = [srcDir, distDir];
  }

  async onModuleInit() {
    await this.loadNodeDefinitions();
  }

  private async loadNodeDefinitions() {
    try {
      this.logger.log('Starting to load node definitions...');
      
      for (const dir of this.nodesDirs) {
        this.logger.log(`Checking directory: ${dir}`);
        try {
          const files = await readdir(dir);
          this.logger.log(`Found ${files.length} files in ${dir}`);
          
          for (const file of files) {
            if (file.endsWith('.node.js') || file.endsWith('.node.ts')) {
              try {
                const nodePath = join(dir, file);
                this.logger.log(`Loading node from: ${nodePath}`);
                
                const nodeModule = await import(nodePath);
                const nodeDefinition: NodeDefinition = nodeModule.default;
                
                if (nodeDefinition && nodeDefinition.type) {
                  this.nodeDefinitions.set(nodeDefinition.type, nodeDefinition);
                  this.logger.log(`Successfully loaded node: ${nodeDefinition.type}`);
                } else {
                  this.logger.warn(`Invalid node definition in file: ${file}`);
                }
              } catch (error) {
                this.logger.error(`Error loading node from file ${file}:`, error);
              }
            }
          }
        } catch (error) {
          this.logger.warn(`Directory not accessible: ${dir}`, error.message);
        }
      }
      
      this.logger.log(`Loaded ${this.nodeDefinitions.size} node definitions successfully`);
    } catch (error) {
      this.logger.error('Error loading node definitions:', error);
    }
  }

  async findAll(): Promise<NodeDefinition[]> {
    const nodes = Array.from(this.nodeDefinitions.values());
    this.logger.log(`Returning ${nodes.length} node definitions`);
    return nodes;
  }

  async findOne(type: string): Promise<NodeDefinition> {
    const nodeDefinition = this.nodeDefinitions.get(type);
    if (!nodeDefinition) {
      this.logger.warn(`Node type ${type} not found`);
      throw new Error(`Node type ${type} not found`);
    }
    return nodeDefinition;
  }

  async executeNode(
    type: string,
    inputs: Record<string, any>,
    properties: Record<string, any>
  ): Promise<Record<string, any>> {
    const nodeDefinition = await this.findOne(type);
    if (!nodeDefinition.execute) {
      throw new Error(`Node type ${type} does not have an execute function`);
    }
    return nodeDefinition.execute(inputs, properties);
  }
}
