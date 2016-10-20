"use strict";
const path = require('path');
const development_tool_1 = require('development-tool');
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    moduleTaskConfig(oper, option, env) {
        return {
            oper: oper,
            env: env,
            option: option,
            runTasks() {
                let tasks = ['clean'];
                switch (oper) {
                    case development_tool_1.Operation.build:
                        tasks = ['clean', ['copy-asserts', 'tscompile']];
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    case development_tool_1.Operation.test:
                    case development_tool_1.Operation.e2e:
                    case development_tool_1.Operation.release:
                        tasks = ['clean', ['copy-asserts', 'tscompile'], 'test'];
                        if (env.watch) {
                            tasks.push('watch');
                        }
                        break;
                    case development_tool_1.Operation.deploy:
                        tasks = ['clean', ['copy-asserts', 'tscompile'], 'test'];
                        break;
                }
                return tasks;
            }
        };
    },
    moduleTaskLoader(config, findInModule, loadFromDir) {
        let oper = config.oper;
        let taskDirs = [path.join(__dirname, './tasks/build')];
        if (oper >= development_tool_1.Operation.test) {
            taskDirs.push(path.join(__dirname, './tasks/test'));
        }
        console.log('load task from dirs:', taskDirs);
        return loadFromDir(taskDirs);
    }
};
