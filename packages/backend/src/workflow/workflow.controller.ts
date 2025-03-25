import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { IWorkflow } from '@workflow-automation/common';

@Controller('workflow')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Get()
  findAll() {

    return this.workflowService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id);
    return this.workflowService.findOne(id);
  }

  @Get(':id/execution/logs')
  async getWorkflowExecutions(@Param('id') id: string) {
    return this.workflowService.getWorkflowExecutions(id);
  }
  @Post()
  create(@Body() createWorkflowDto: CreateWorkflowDto) {
    console.log(createWorkflowDto);
    return this.workflowService.create(createWorkflowDto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateWorkflowDto: UpdateWorkflowDto) {
    return this.workflowService.update(id, updateWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workflowService.remove(id);
  }

  @Post(':id/stop')
  async stopWorkflow(@Param('id') id: string) {
    return this.workflowService.stopWorkflow(id);
  }
  @Post('execute')
  async TestExcuteWorkFlow(@Body() workflow: IWorkflow) {
    return this.workflowService.executeWorkflow(workflow);
  }
}
