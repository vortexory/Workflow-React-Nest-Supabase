import { INodeExecutionData } from '@workflow-automation/common';

export abstract class BaseNode {
  protected settings: Record<string, any> = {};

  async onInit(settings: Record<string, any>): Promise<void> {
    this.settings = settings;
  }

  getSettings(): Record<string, any> {
    return this.settings;
  }

  abstract execute(data: INodeExecutionData[]): Promise<INodeExecutionData[]>;
}
