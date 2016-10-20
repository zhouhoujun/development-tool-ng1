"use strict";
const path = require('path');
const cache = require('gulp-cached');
const ts = require('gulp-typescript');
const merge = require('merge2');
module.exports = (gulp, config) => {
    let option = config.option;
    let tscfile = path.join(config.env.root, option.tsconfig || './tsconfig.json');
    let tsProject = ts.createProject(tscfile);
    gulp.task('tscompile', () => {
        let tsResult = gulp.src(option.ts || (option.src + '/**/*.ts'))
            .pipe(cache('typescript'))
            .pipe(tsProject());
        return merge([
            tsResult.dts.pipe(gulp.dest(option.dist)),
            tsResult.js.pipe(gulp.dest(option.dist))
        ]);
    });
};
