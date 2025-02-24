import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NodeType } from '@prisma/client';
import { CreateNodeTypeDto } from './dto/create-node-type.dto';
import { UpdateNodeTypeDto } from './dto/update-node-type.dto';

@Injectable()
export class NodesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<NodeType[]> {
    return this.prisma.nodeType.findMany();
  }

  async findOne(type: string): Promise<NodeType> {
    const nodeType = await this.prisma.nodeType.findUnique({
      where: { type },
    });

    if (!nodeType) {
      throw new Error(`Node type ${type} not found`);
    }

    return nodeType;
  }

  async create(createNodeTypeDto: CreateNodeTypeDto): Promise<NodeType> {
    return this.prisma.nodeType.create({
      data: {
        type: createNodeTypeDto.type,
        displayName: createNodeTypeDto.displayName,
        description: createNodeTypeDto.description,
        icon: createNodeTypeDto.icon,
        color: createNodeTypeDto.color,
        inputs: createNodeTypeDto.inputs || [],
        outputs: createNodeTypeDto.outputs || [],
        properties: createNodeTypeDto.properties || [],
      },
    });
  }

  async update(type: string, updateNodeTypeDto: UpdateNodeTypeDto): Promise<NodeType> {
    await this.findOne(type);

    return this.prisma.nodeType.update({
      where: { type },
      data: {
        displayName: updateNodeTypeDto.displayName,
        description: updateNodeTypeDto.description,
        icon: updateNodeTypeDto.icon,
        color: updateNodeTypeDto.color,
        inputs: updateNodeTypeDto.inputs,
        outputs: updateNodeTypeDto.outputs,
        properties: updateNodeTypeDto.properties,
      },
    });
  }

  async remove(type: string): Promise<void> {
    await this.findOne(type);
    await this.prisma.nodeType.delete({
      where: { type },
    });
  }
}
