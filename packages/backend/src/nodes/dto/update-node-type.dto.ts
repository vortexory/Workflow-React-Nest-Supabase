import { PartialType } from '@nestjs/mapped-types';
import { CreateNodeTypeDto } from './create-node-type.dto';

export class UpdateNodeTypeDto extends PartialType(CreateNodeTypeDto) {}
