/// <reference types="gulp" />
/// <reference types="karma" />
import { Gulp } from 'gulp';
import { ITask, ITaskInfo, ITaskContext } from 'development-core';
import * as karma from 'karma';
import { KarmaSystemjsOption } from '../WebTaskOption';
export declare class KarmaTest implements ITask {
    private info;
    constructor(info: ITaskInfo);
    getInfo(): ITaskInfo;
    setup(ctx: ITaskContext, gulp: Gulp): string;
    getRelativePaths(ctx: ITaskContext, rootpath: string, prefix?: string): any;
    initkarmaSystemjsPlugin(cfg: karma.ConfigOptions, ctx: ITaskContext): karma.ConfigOptions;
    getDefaultAdapter(): {
        name: string;
        template: string;
    };
    checkAdapter(sysKarma: KarmaSystemjsOption, ctx: ITaskContext): string;
}
