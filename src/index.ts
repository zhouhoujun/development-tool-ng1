/// <reference types="mocha"/>
import * as _ from 'lodash';
import { ITask, ITaskConfig, bindingConfig, ITaskContext, IContextDefine, taskdefine } from 'development-core';
import { Clean } from './tasks/clean';
import { StartServer } from './tasks/serve';
import { KarmaTest } from './tasks/test';
import { IWebTaskOption } from './WebTaskOption';
export * from './WebTaskOption';


@taskdefine
export class WebDefine implements IContextDefine {
    getContext(config: ITaskConfig): ITaskContext {
        // register default asserts.
        config.option.asserts = _.extend({
            ts: 'development-assert-ts',
            js: 'development-assert-js'
        }, config.option.asserts);


        return bindingConfig(config);
    }

    tasks(ctx: ITaskContext): Promise<ITask[]> {
        let tasks = [
            Clean,
            StartServer,
            KarmaTest
        ];
        let option: IWebTaskOption = ctx.option;
        if (option.forceTest === false || ctx.env.test === false || ctx.env.test === 'false') {
            tasks.pop();
        }
        return ctx.findTasks(tasks);
        // return ctx.findTasksInDir(path.join(__dirname, './tasks'));
    }
}
