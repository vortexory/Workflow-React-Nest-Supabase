import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { WorkflowEntity } from './workflow.entity';
import { WorkflowStatus, INodeExecutionResult } from '@workflow-automation/common';

@Entity('workflow_executions')
export class WorkflowExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkflowEntity)
  workflow: WorkflowEntity;

  @Column()
  workflowId: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  })
  status: WorkflowStatus;

  @Column('jsonb', { nullable: true })
  input: any;

  @Column('jsonb', { nullable: true })
  output: any;

  @Column('jsonb')
  nodeResults: { [nodeId: string]: INodeExecutionResult };

  @CreateDateColumn()
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'text', nullable: true })
  error?: string;
}
