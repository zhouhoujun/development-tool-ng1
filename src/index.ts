/// <reference types="mocha"/>
import * as _ from 'lodash';
import { ITask, ITaskConfig, bindingConfig, ITaskContext, IContextDefine, taskdefine } from 'development-core';

export * from './WebTaskOption';
import * as path from 'path';


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
        return ctx.findTasksInDir(path.join(__dirname, './tasks'));
    }
}
