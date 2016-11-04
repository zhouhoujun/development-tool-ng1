/// <reference types="mocha"/>
import * as _ from 'lodash';
import { ITask, ITaskConfig, IEnvOption, Operation, ITaskOption, ITaskDefine, taskdefine } from 'development-core';

export * from './WebTaskOption';

import * as webTasks from './tasks/WebDefaultTask';

@taskdefine
export class Define implements ITaskDefine {
    loadConfig(oper: Operation, option: ITaskOption, env: IEnvOption): ITaskConfig {
        // register default asserts.
        option.asserts = _.extend({
            ts: 'development-assert-ts',
            js: 'development-assert-js'
        }, option.asserts);


        return <ITaskConfig>{
            oper: oper,
            env: env,
            option: option
        }
    }

    loadTasks(config: ITaskConfig): Promise<ITask[]> {
        return config.findTasks(webTasks)
            .then(tasks => {
                if (config.env.serve) {
                    return config.findTasks(webTasks, { group: 'serve' })
                        .then(serTasks => {
                            return tasks.concat(serTasks || []);
                        });
                } else {
                    return tasks;
                }

            });
    }
}
