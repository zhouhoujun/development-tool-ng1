import { ITask, ITaskConfig, IContextDefine, IAssertOption, IEnvOption, ITaskContext } from 'development-core';
export * from './WebTaskOption';
export declare class WebDefine implements IContextDefine {
    loadConfig(option: IAssertOption, env: IEnvOption): ITaskConfig;
    setContext(ctx: ITaskContext): void;
    tasks(ctx: ITaskContext): Promise<ITask[]>;
}
