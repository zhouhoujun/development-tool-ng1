# packaged development-tool-node

This repo is for distribution on `npm`. The source for this module is in the
[main repo](https://github.com/zhouhoujun/development-tool-node/src/mastert).
Please file issues and pull requests against that repo.
This package use to develop kit for typescript node project development via gulp tasks.

## Install

You can install this package either with `npm`.

### npm

```shell

npm install development-tool-node

```

You can `import` modules:

```js
import * as gulp from 'gulp';
import  { Development } from 'development-tool';

Development.create(gulp, __dirname, {
    tasks:[
        src: 'src',
        dist: 'lib',
        loader: {
            type:'module' //'module, dir'
            module:'development-tool-node'
        }
    ]
});

Development.create(gulp, __dirname, {
    tasks:{
        src: 'src',
        dist: 'lib',
        loader: {
            type:'module' //'module, dir'
            module:'development-tool-node'
        }
    }
});

Development.create(gulp, __dirname, {
    tasks: {
        src: 'src',
        dist: 'lib',
        loader: {
            type: 'dir',
            // taskDefine: taskDefine,
            configModule: path.join(__dirname, './src/task.ts')
        }
    }
});

```

https://github.com/zhouhoujun/development-tool-node.git

## Documentation

Documentation is available on the
[development-tool-node docs site](https://github.com/zhouhoujun/development-tool-node).

## License

MIT © [Houjun](https://github.com/zhouhoujun/)