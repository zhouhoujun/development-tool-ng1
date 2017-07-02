import * as _ from 'lodash';
import { ITask, RunWay, ITaskConfig, IAssertOption, IEnvOption, ITaskContext, IContextDefine, taskdefine } from 'development-core';
import { Clean } from './tasks/clean';
import { StartServer } from './tasks/serve';
import { KarmaTest } from './tasks/test';
import { IWebTaskOption } from './WebTaskOption';
export * from './WebTaskOption';


@taskdefine()
export class WebDefine implements IContextDefine {
    loadConfig(option: IAssertOption, env: IEnvOption): ITaskConfig {
        // register default asserts.
        option.assertsOrder = 0;
        option.asserts = _.extend({
            ts: 'development-assert-ts',
            js: 'development-assert-js'
        }, option.asserts || {});


        return <ITaskConfig>{
            option: option,
            env: env
        };
    }

    setContext(ctx: ITaskContext) {
        let webOption = ctx.option as IWebTaskOption;

        if (webOption.forceTest !== false && webOption.test !== false) {
            ctx.add(<ITaskConfig>{
                option: <IAssertOption>{
                    name: 'test',
                    order: webOption.testOrder || (total => { return { value: 2 / total, runWay: RunWay.parallel } }),
                    loader: (ctx) => {
                        return ctx.findTasks(KarmaTest);
                    }
                }
            });
        }
        ctx.add(<ITaskConfig>{
            option: <IAssertOption>{
                name: 'serve',
                order: (total, ctx) => ctx.env.test ? { value: 2 / total, runWay: RunWay.parallel } : 1,
                loader: (ctx) => {
                    return ctx.findTasks(StartServer);
                }
            }
        })
    }

    tasks(ctx: ITaskContext): Promise<ITask[]> {
        return ctx.findTasks(Clean);
        // let tasks = [
        //     Clean,
        //     StartServer,
        //     KarmaTest
        // ];
        // let option: IWebTaskOption = ctx.option;
        // if (option.forceTest === false || ctx.env.test === false || ctx.env.test === 'false') {
        //     tasks.pop();
        // }
        // return ctx.findTasks(tasks);
        // return ctx.findTasksInDir(path.join(__dirname, './tasks'));
    }
}
