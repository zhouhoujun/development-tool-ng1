/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext } from 'development-core';
export declare class StartService implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
