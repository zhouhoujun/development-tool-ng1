/// <reference types="mocha"/>
import * as path from 'path';
import { WatchEvent } from 'gulp';
import { Src, Task, TaskNameSequence, IMap, TaskConfig, EnvOption, Operation, TaskOption, tasksInModule, tasksInDir, ITaskDefine } from 'development-tool';


export interface Ng1BuildOption extends TaskOption {
    /**
     * karma config File
     * 
     * @type {string}
     * @memberOf Ng1BuildOption
     */
    karmaConfigFile?: string;

    /**
     * e2e test protractor config file
     * 
     * @type {string}
     * @memberOf Ng1BuildOption
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
     * @memberOf Ng1BuildOption
     */
    e2e?: Src;

    /**
     * js src.
     * 
     * @type {Src}
     * @memberOf Ng1BuildOption
     */
    js?: Src;

    /**
     * js src.
     * 
     * @type {Src}
     * @memberOf Ng1BuildOption
     */
    less?: Src;

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
     * static asserts.
     * 
     * @type {string[]}
     * @memberOf NodeBuildOption
     */
    asserts?: IMap<Src>;
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
            runTasks(): TaskNameSequence {
                let tasks: TaskNameSequence = ['clean'];
                switch (oper) {
                    case Operation.build:
                        tasks = ['clean', ['copy-asserts', 'tscompile']];
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    case Operation.test:
                    case Operation.e2e:
                    case Operation.release:
                        tasks = ['clean', ['copy-asserts', 'tscompile'], 'test'];
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    // case Operation.e2e:
                    //     break;
                    // case Operation.release:
                    //     break;
                    case Operation.deploy:
                        tasks = ['clean', ['copy-asserts', 'tscompile'], 'test'];
                        break;
                }
                return tasks;
            }
        }
    },

    moduleTaskLoader(config: TaskConfig, findInModule: tasksInModule, loadFromDir: tasksInDir): Promise<Task[]> {
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
        return loadFromDir(taskDirs);
    }
};
