"use strict";
const browserSync = require('browser-sync');
module.exports = (gulp, config) => {
    let option = config.option;
    let dist = config.getDist(config.option);
    option.browsersync = option.browsersync || {
        server: {
            baseDir: config.getDist(config.option)
        },
        open: true,
        port: process.env.PORT || 3000,
        files: `${dist}/**/*`
    };
    gulp.task('browsersync', (callback) => {
        browserSync(option.browsersync, (err, bs) => {
            if (err) {
                callback(err);
            }
        });
    });
};

//# sourceMappingURL=../../sourcemaps/tasks/build/browsersync.js.map
