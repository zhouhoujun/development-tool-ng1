import * as gulp from 'gulp';
import 'development-core';
import { Development } from 'development-tool';
import 'development-tool-node';

const requireDir = require('require-dir');

const webTasks = requireDir('./src/tasks');
console.log(webTasks);

Development.create(gulp, __dirname, [
    {
        src: 'src',
        dist: 'lib',
        buildDist: 'build',
        testSrc: 'test/**/*.spec.ts',
        loader: 'development-tool-node'
    }
]).start();
