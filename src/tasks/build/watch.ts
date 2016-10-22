import { Gulp, WatchCallback, WatchEvent } from 'gulp';
import * as _ from 'lodash';
import { WebTaskOption } from '../../task';
import { Src, TaskConfig } from 'development-tool';
// const browserSync = require('browser-sync');

export = (gulp: Gulp, config: TaskConfig) => {
    let option: WebTaskOption = <WebTaskOption>config.option;
    gulp.task('watch', () => {

        // watch ts.
        let watchTsk: (string | WatchCallback)[] = ['tscompile'];
        if (config.env.test) {
            watchTsk.push('test');
        }
        watchTsk.push(<WatchCallback>(event: WatchEvent) => {
            option.tsWatchChanged && option.tsWatchChanged(config, event);
        });
        gulp.watch(option.ts || (option.src + '/**/*.ts'), watchTsk);

        // watch asserts
        if (option.asserts) {
            _.each(_.keys(option.asserts), f => {
                let asst = option.asserts[f];
                let src: Src = (_.isArray(asst) || _.isString(asst)) ? asst : asst.src;
                gulp.watch(src,
                    [
                        'copy-' + f,
                        (event: WatchEvent) => {
                            option.assertWatchChanged && option.assertWatchChanged(f, config, event);
                        }
                    ]);
            });
        }
    });
}
