/// <reference types="mocha"/>
import * as path from 'path';
import { WatchEvent } from 'gulp';
import { Src, Asserts, Task, IMap, TaskConfig, EnvOption, Operation, TaskOption, ITaskDefine } from 'development-tool';
import * as chalk from 'chalk';
import { Options } from 'browser-sync';

export interface WebTaskOption extends TaskOption {
    /**
     * browser setting
     * 
     * @type {Options}
     * @memberOf WebTaskOption
     */
    browsersync?: Options;
    /**
     * karma config File
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    karmaConfigFile?: string;

    /**
     * e2e test protractor config file
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    protractorFile?: string;

    /**
     * test code src to run test.
     * 
     * @type {(string | string[])}
     * @memberOf NodeTestConfig
     */
    test?: Src;

    /**
     * e2e test src.
     * 
     * @type {Src}
     * @memberOf WebTaskOption
     */
    e2e?: Src;

    /**
     * tsconfig for typescript
     * 
     * @type {string}
     * @memberOf NodeBuildOption
     */
    tsconfig?: string;
    /**
     * typescript src.
     * 
     * @type {Src}
     * @memberOf NodeBuildOption
     */
    ts?: Src;
    /**
     * watch typescript file changed.
     * 
     * @param {TaskConfig} config
     * @param {WatchEvent} event
     * 
     * @memberOf NodeBuildOption
     */
    tsWatchChanged?(config: TaskConfig, event: WatchEvent): void;

    /**
     * static asserts config to copy to dist.
     * 
     * @type {(IMap<Src | Asserts>)}
     * @memberOf WebTaskOption
     */
    asserts?: IMap<Src | Asserts>;
    /**
     * watch assert file changed.
     * 
     * @param {string} assert
     * @param {TaskConfig} config
     * @param {WatchEvent} event
     * 
     * @memberOf NodeBuildOption
     */
    assertWatchChanged?(assert: string, config: TaskConfig, event: WatchEvent): void;
}

export default <ITaskDefine>{
    moduleTaskConfig(oper: Operation, option: TaskOption, env: EnvOption): TaskConfig {
        return {
            oper: oper,
            env: env,
            option: option,
            runTasks(subGroupTask: Src): Src[] {
                let tasks: Src[] = ['clean'];
                switch (oper) {
                    case Operation.build:
                        tasks = ['clean', ['copy-asserts', 'tscompile']];
                        if (subGroupTask) {
                            tasks.push(subGroupTask);
                        }
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    case Operation.test:
                    case Operation.release:
                        tasks = ['clean', ['copy-asserts', 'tscompile']];
                        if (subGroupTask) {
                            tasks.push(subGroupTask);
                        }
                        tasks.push('test');
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    case Operation.e2e:
                        console.log(chalk.red('can not support e2e test.'))
                        break;
                    // case Operation.release:
                    //     break;
                    case Operation.deploy:
                        tasks = ['clean', ['copy-asserts', 'tscompile']];
                        if (subGroupTask) {
                            tasks.push(subGroupTask);
                        }
                        tasks.push('test');
                        break;
                }
                return tasks;
            }
        }
    },

    moduleTaskLoader(config: TaskConfig): Promise<Task[]> {
        let oper = config.oper;
        let taskDirs = [path.join(__dirname, './tasks/build')];
        if (oper >= Operation.test) {
            taskDirs.push(path.join(__dirname, './tasks/test'));
        }
        // if (oper >= Operation.e2e) {
        //     taskDirs.push(path.join(__dirname, './tasks/e2e'));
        // }
        // if (oper >= Operation.release) {
        //     taskDirs.push(path.join(__dirname, './tasks/release'));
        // }
        // if (oper >= Operation.deploy) {
        //     taskDirs.push(path.join(__dirname, './tasks/deploy'));
        // }
        console.log('load task from dirs:', taskDirs);
        return config.findTasksInDir(taskDirs);
    }
};
