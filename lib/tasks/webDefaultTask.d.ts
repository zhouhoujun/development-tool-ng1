/// <reference types="gulp" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext } from 'development-core';
export declare class Clean implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
export declare class BuildTest implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
export declare class DeployTest implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
export declare class StartService implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): any;
}
