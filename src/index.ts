/// <reference types="mocha"/>
import * as _ from 'lodash';
import { ITask, ITaskConfig, bindingConfig, ITaskContext, IContextDefine, taskdefine } from 'development-core';

export * from './WebTaskOption';

import * as webTasks from './tasks/WebDefaultTask';

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
        return ctx.findTasks(webTasks)
            .then(tasks => {
                if (ctx.env.serve) {
                    return ctx.findTasks(webTasks, { group: 'serve' })
                        .then(serTasks => {
                            return tasks.concat(serTasks || []);
                        });
                } else {
                    return tasks;
                }

            });
    }
}
