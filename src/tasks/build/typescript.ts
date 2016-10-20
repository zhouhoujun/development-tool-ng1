import { Gulp } from 'gulp';
import { Ng1BuildOption } from '../../task';
import { TaskConfig } from 'development-tool';
import * as path from 'path';

const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const merge = require('merge2');

export = (gulp: Gulp, config: TaskConfig) => {
    let option: Ng1BuildOption = config.option;
    let tscfile = path.join(config.env.root, option.tsconfig || './tsconfig.json');
    let tsProject = ts.createProject(tscfile);

    // console.log('register tscompile task by gulp', tscfile);
    gulp.task('tscompile', () => {
        let tsResult = gulp.src(option.ts || (option.src + '/**/*.ts'))
            .pipe(cache('typescript'))
            .pipe(tsProject());

        return merge([
            // Merge the two output streams, so this task is finished when the IO of both operations are done. 
            tsResult.dts.pipe(gulp.dest(option.dist)),
            tsResult.js.pipe(gulp.dest(option.dist))
        ]);
    });
}
