"use strict";
let del = require('del');
module.exports = (gulp, config) => {
    let dist = config.getDist(config.option);
    gulp.task('clean', () => {
        return del(dist);
    });
};

//# sourceMappingURL=../../sourcemaps/tasks/build/clean.js.map
