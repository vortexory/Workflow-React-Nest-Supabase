import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { readdir, readFile, stat } from 'fs/promises';
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
  private readonly nodeCategories = ['trigger', 'input', 'organization', 'transform'];

  constructor() {
    this.logger.log(`Node categories: ${this.nodeCategories.join(', ')}`);
  }

  async onModuleInit() {
    await this.loadNodeDefinitions();
  }

  private async findNodeFiles(dir: string): Promise<string[]> {
    const nodeFiles: string[] = [];
    
    try {
      const entries = await readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Recursively search subdirectories
          const subDirFiles = await this.findNodeFiles(fullPath);
          nodeFiles.push(...subDirFiles);
        } else if (entry.isFile() && (entry.name.endsWith('.node.ts') || entry.name.endsWith('.node.js'))) {
          nodeFiles.push(fullPath);
        }
      }
    } catch (error) {
      this.logger.warn(`Could not read directory ${dir}: ${error.message}`);
    }
    
    return nodeFiles;
  }

  private async loadNodeDefinitions() {
    try {
      this.logger.log('Starting to load node definitions...');
      
      for (const category of this.nodeCategories) {
        const categoryDir = resolve(__dirname, category);
        this.logger.log(`Checking category directory: ${categoryDir}`);
        
        try {
          const nodeFiles = await this.findNodeFiles(categoryDir);
          this.logger.log(`Found ${nodeFiles.length} node files in ${category}`);
          
          for (const nodePath of nodeFiles) {
            try {
              this.logger.log(`Loading node from: ${nodePath}`);
              const nodeModule = await import(nodePath);
              const nodeDefinition: NodeDefinition = nodeModule.default;
              
              if (nodeDefinition && nodeDefinition.type) {
                // Add category to type if not present
                if (!nodeDefinition.type.includes('/')) {
                  nodeDefinition.type = `${category}/${nodeDefinition.type}`;
                }
                
                this.nodeDefinitions.set(nodeDefinition.type, nodeDefinition);
                this.logger.log(`Successfully loaded node: ${nodeDefinition.type}`);
              } else {
                this.logger.warn(`Invalid node definition in file: ${nodePath}`);
              }
            } catch (error) {
              this.logger.error(`Error loading node from file ${nodePath}:`, error);
            }
          }
        } catch (error) {
          this.logger.warn(`Category directory not accessible: ${categoryDir}`, error.message);
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
