/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskConfig, IDynamicTask, IDynamicTasks } from 'development-core';
export declare class WebDefaultTasks implements IDynamicTasks {
    tasks(): IDynamicTask[];
}
export declare class StartService implements ITask {
    decorator: ITaskInfo;
    setup(config: ITaskConfig, gulp: Gulp): any;
}
