import * as _ from 'lodash';
import { ITask, Operation, RunWay, ITaskConfig, taskdefine, IContextDefine, IAssertOption, IEnvOption, ITaskContext } from 'development-core';
import { Clean } from './tasks/clean';
import { StartServer } from './tasks/serve';
import { KarmaTest } from './tasks/test';
import { IWebTaskOption } from './WebTaskOption';
export * from './WebTaskOption';


@taskdefine()
export class WebDefine implements IContextDefine {
    loadConfig(option: IAssertOption, env: IEnvOption): ITaskConfig {
        // register default asserts.
        if (_.isUndefined(option.assertsOrder)) {
            option.assertsOrder = 0;
        }
        option.asserts = _.extend({
            css: Operation.default | Operation.autoWatch,
            jpeg: Operation.default | Operation.autoWatch,
            jpg: Operation.default | Operation.autoWatch,
            gif: Operation.default | Operation.autoWatch,
            png: Operation.default | Operation.autoWatch,
            ioc: Operation.default | Operation.autoWatch,
            svg: Operation.default | Operation.autoWatch,
            ttf: Operation.default | Operation.autoWatch,
            woff: Operation.default | Operation.autoWatch,
            eot: Operation.default | Operation.autoWatch,
            ts: 'development-assert-ts',
            js: Operation.default | Operation.autoWatch
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
                option: <IWebTaskOption>{
                    name: 'test',
                    karma: webOption.karma,
                    order: webOption.testOrder || (total => { return { value: 2 / total, runWay: RunWay.parallel } }),
                    loader: (ctx) => {
                        return ctx.findTasks(KarmaTest);
                    }
                }
            });
        }
        if (ctx.oper & Operation.serve) {
            ctx.add(<ITaskConfig>{
                option: <IWebTaskOption>{
                    name: 'serve',
                    browsersync: webOption.browsersync,
                    order: (total, ctx) => ctx.env.test ? { value: 2 / total, runWay: RunWay.parallel } : 1,
                    loader: (ctx) => {
                        return ctx.findTasks(StartServer);
                    }
                }
            });
        }
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
