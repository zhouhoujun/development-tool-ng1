import { Gulp } from 'gulp';
import { TaskConfig } from 'development-tool';

let del = require('del');


export = (gulp: Gulp, config: TaskConfig) => {
  // console.log('register clean task by gulp');
  gulp.task('clean', () => {
    return del(config.option.dist);
  });
};
