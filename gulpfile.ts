import * as gulp from 'gulp';
import { Development } from 'development-tool';

Development.create(gulp, __dirname, {
    tasks: {
        src: 'src',
        dist: 'lib',
        loader: {
            type: 'module',
            module: 'development-tool-node'
        }
    }
});
