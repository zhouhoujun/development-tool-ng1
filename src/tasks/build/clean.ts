import { Gulp } from 'gulp';
import { TaskConfig } from 'development-tool';

let del = require('del');


export = (gulp: Gulp, config: TaskConfig) => {

  let dist = config.getDist(config.option);
  gulp.task('clean', () => {
    return del(dist);
  });
}
