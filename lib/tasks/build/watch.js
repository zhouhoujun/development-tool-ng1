"use strict";
const _ = require('lodash');
module.exports = (gulp, config) => {
    let option = config.option;
    gulp.task('watch', () => {
        let watchTsk = ['tscompile'];
        if (config.env.test) {
            watchTsk.push('test');
        }
        watchTsk.push((event) => {
            option.tsWatchChanged && option.tsWatchChanged(config, event);
        });
        gulp.watch(option.ts || (option.src + '/**/*.ts'), watchTsk);
        if (option.asserts) {
            _.each(_.keys(option.asserts), f => {
                let asst = option.asserts[f];
                let src = (_.isArray(asst) || _.isString(asst)) ? asst : asst.src;
                gulp.watch(src, [
                    'copy-' + f,
                        (event) => {
                        option.assertWatchChanged && option.assertWatchChanged(f, config, event);
                    }
                ]);
            });
        }
    });
};

//# sourceMappingURL=../../sourcemaps/tasks/build/watch.js.map
