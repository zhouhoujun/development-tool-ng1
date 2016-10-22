"use strict";
const development_tool_1 = require('development-tool');
const path = require('path');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge2');
module.exports = (gulp, config) => {
    let option = config.option;
    let tscfile = path.join(config.env.root, option.tsconfig || './tsconfig.json');
    let tsProject = ts.createProject(tscfile);
    let dist = config.getDist(config.option);
    if (config.oper === development_tool_1.Operation.deploy || config.oper === development_tool_1.Operation.release) {
        gulp.task('tscompile', () => {
            let tsResult = gulp.src(option.ts || (option.src + '/**/*.ts'))
                .pipe(cache('typescript'))
                .pipe(tsProject());
            return merge([
                tsResult.dts.pipe(gulp.dest(dist)),
                tsResult.js.pipe(gulp.dest(dist))
            ]);
        });
    }
    else {
        gulp.task('tscompile', () => {
            let tsResult = gulp.src(option.ts || (option.src + '/**/*.ts'))
                .pipe(cache('typescript'))
                .pipe(sourcemaps.init())
                .pipe(tsProject());
            return merge([
                tsResult.dts.pipe(gulp.dest(dist)),
                tsResult.js.pipe(sourcemaps.write('./sourcemaps')).pipe(gulp.dest(dist))
            ]);
        });
    }
};

//# sourceMappingURL=../../sourcemaps/tasks/build/typescript.js.map
