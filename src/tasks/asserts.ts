/// <reference types="mocha"/>
import * as _ from 'lodash';
import * as path from 'path';
import { IDynamicTaskOption, Operation, IDynamicTasks, dynamicTask } from 'development-core';
// import * as chalk from 'chalk';
import { IWebTaskOption } from '../WebTaskOption';


const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');


@dynamicTask({
    group: 'ts'
})
export class TsTasks implements IDynamicTasks {
    tasks() {
        return <IDynamicTaskOption[]>[
            {
                name: 'ts-compile',
                pipes: [
                    () => cache('typescript'),
                    sourcemaps.init,
                    (config) => {
                        let option = <IWebTaskOption>config.option;
                        // console.log(config);
                        let tsProject = ts.createProject(path.join(config.env.root || '', option.tsconfig || './tsconfig.json'));
                        return tsProject();
                    }
                ],
                output: [
                    (tsmap, config, dt, gulp) => tsmap.dts.pipe(gulp.dest(config.getDist(dt))),
                    (tsmap, config, dt, gulp) => {
                        if (config.oper === Operation.release || config.oper === Operation.deploy) {
                            return tsmap.js.pipe(babel((<IWebTaskOption>config.option).tsBabelOption || { presets: ['es2015'] }))
                                .pipe(uglify()).pipe(sourcemaps.write('./sourcemaps'))
                                .pipe(gulp.dest(config.getDist(dt)));
                        } else {
                            return tsmap.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(config.getDist(dt)));
                        }
                    }
                ]
            },
            {
                name: 'ts-watch',
                oper: Operation.build | Operation.e2e | Operation.test,
                watchTasks: ['ts-compile']
            }
        ];
    }
}


@dynamicTask({
    group: 'js'
})
export class JsTasks implements IDynamicTasks {
    tasks() {
        return <IDynamicTaskOption[]>[
            {
                name: 'js-compile',
                pipes: [
                    () => cache('javascript'),
                    sourcemaps.init,
                    (config) => babel((<IWebTaskOption>config.option).jsBabelOption || { presets: ['es2015'] }),
                    () => sourcemaps.write('./sourcemaps')
                ]
            },
            {
                name: 'js-watch',
                oper: Operation.build | Operation.e2e | Operation.test,
                watchTasks: ['js-compile']
            }
        ];
    }
}
