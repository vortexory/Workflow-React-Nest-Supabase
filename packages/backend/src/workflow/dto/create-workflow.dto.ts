import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateWorkflowDto {
  @IsString()
  name: string;

  @IsArray()
  @IsOptional()
  nodes: any[] = [];

  @IsArray()
  @IsOptional()
  edges: any[] = [];
}
