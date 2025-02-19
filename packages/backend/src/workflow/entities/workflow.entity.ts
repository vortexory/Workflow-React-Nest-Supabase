import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IWorkflow, INodeData, IEdge } from '@workflow-automation/common';

@Entity('workflows')
export class WorkflowEntity implements IWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('jsonb')
  nodes: INodeData[];

  @Column('jsonb')
  edges: IEdge[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
