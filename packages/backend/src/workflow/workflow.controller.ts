import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { IWorkflow } from '@workflow-automation/common';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  create(@Body() workflow: IWorkflow) {
    return this.workflowService.create(workflow);
  }

  @Get()
  findAll() {
    return this.workflowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workflowService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() workflow: IWorkflow) {
    return this.workflowService.update(id, workflow);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowService.remove(id);
  }

  @Post(':id/execute')
  execute(@Param('id') id: string, @Body() input: any) {
    return this.workflowService.execute(id, input);
  }

  @Get('execution/:id')
  getExecution(@Param('id') id: string) {
    return this.workflowService.getExecution(id);
  }
}
