import { ITask, ITaskConfig, ITaskContext, IContextDefine } from 'development-core';
export * from './WebTaskOption';
export declare class WebDefine implements IContextDefine {
    getContext(config: ITaskConfig): ITaskContext;
    tasks(ctx: ITaskContext): Promise<ITask[]>;
}
