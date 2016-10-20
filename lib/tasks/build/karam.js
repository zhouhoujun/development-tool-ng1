"use strict";
const karma_1 = require('karma');
const path = require('path');
module.exports = (gulp, config) => {
    let configFile = config.option.karmaConfigFile;
    if (!path.isAbsolute(configFile)) {
        configFile = path.join(config.dirname, configFile);
    }
    gulp.task('ng1.test', (callback) => {
        new karma_1.Server({
            configFile: configFile
        }, callback).start();
    });
};
