import { IsString, IsArray, IsOptional } from 'class-validator';

export class CreateNodeTypeDto {
  @IsString()
  type: string;

  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsArray()
  @IsOptional()
  inputs?: any[];

  @IsArray()
  @IsOptional()
  outputs?: any[];

  @IsArray()
  @IsOptional()
  properties?: any[];
}
