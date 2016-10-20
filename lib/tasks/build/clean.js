"use strict";
let del = require('del');
module.exports = (gulp, config) => {
    gulp.task('clean', () => {
        return del(config.option.dist);
    });
};
