/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext, IDynamicTaskOption, IDynamicTasks } from 'development-core';
export declare class WebDefaultTasks implements IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}
export declare class StartService implements ITask {
    decorator: ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
