"use strict";
const karma_1 = require('karma');
const path = require('path');
module.exports = (gulp, config) => {
    let option = config.option;
    let karmaConfigFile = option.karmaConfigFile || './karma.conf.js';
    if (!path.isAbsolute(karmaConfigFile)) {
        karmaConfigFile = path.join(config.env.root, karmaConfigFile);
    }
    gulp.task('test', (callback) => {
        new karma_1.Server({
            configFile: karmaConfigFile
        }, callback).start();
    });
};

//# sourceMappingURL=../../sourcemaps/tasks/test/karam.js.map
