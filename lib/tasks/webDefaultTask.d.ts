/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext, IDynamicTaskOption, IDynamicTasks } from 'development-core';
export declare class WebDefaultTasks implements IDynamicTasks {
    tasks(): IDynamicTaskOption[];
}
export declare class StartService implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
