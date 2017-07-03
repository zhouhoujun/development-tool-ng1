/// <reference types="karma" />
/// <reference types="browser-sync" />
import { Src, Order, IAssertOption, ITaskContext, TaskSource, TaskString, IMap } from 'development-core';
import { Options, FileCallback } from 'browser-sync';
import * as karma from 'karma';
/**
 * jspm mate.
 *
 * @export
 * @interface ISystemjsMate
 */
export interface ISystemjsMate {
    loader: string;
}
export declare type FilePattern = karma.FilePattern | string;
export declare type LoaderFilePattern = FilePattern[] | ((ctx: ITaskContext) => FilePattern[]);
/**
 * jspm Option.
 *
 * @export
 * @interface SystemjsOption
 */
export interface SystemjsOption {
    /**
      * baseURL for test path.
      *
      * @type {TaskString}
      * @memberOf SystemjsOption
      */
    baseURL?: TaskString;
    /**
     * config file. default use package setting.
     *
     * @type {TaskSource}
     * @memberOf SystemjsOption
     */
    config?: TaskSource;
    /**
     * jspm package path. default use package setting.
     *
     * @type {TaskString}
     * @memberOf SystemjsOption
     */
    packages?: TaskString;
    /**
     * systemjs files.
     *
     * @type {TaskSource}
     * @memberOf KarmaSystemjs
     */
    systemjs?: TaskSource;
}
/**
 * karma jspm test config.
 *
 * @export
 * @interface KarmaSystemjs
 */
export interface KarmaSystemjs extends SystemjsOption {
    /**
     * baseURL for test path.
     *
     * @type {string}
     * @memberOf KarmaSystemjs
     */
    baseURL?: string;
    /**
     * config file. default use package setting.
     *
     * @type {Src}
     * @memberOf KarmaSystemjs
     */
    config?: Src;
    /**
     * jspm package path. default use package setting.
     *
     * @type {string}
     * @memberOf KarmaSystemjs
     */
    packages?: string;
    /**
     * load test files.
     *
     * @type {FilePattern[]}
     * @memberOf KarmaSystemjs
     */
    loadFiles?: FilePattern[];
    /**
     * server files.
     *
     * @type {FilePattern[]}
     * @memberOf KarmaSystemjs
     */
    serveFiles?: FilePattern[];
    /**
     * need jspm ^0.17
     *
     * @type {string}
     * @memberOf KarmaSystemjs
     */
    browser?: string;
    paths?: IMap<string>;
    meta?: IMap<ISystemjsMate>;
    useBundles?: boolean;
    stripExtension?: string | boolean;
    cachePackages?: boolean;
}
/**
 * karma jspm test config.
 *
 * @export
 * @interface KarmaSystemjs
 */
export interface KarmaSystemjsOption extends SystemjsOption {
    /**
     * public resource to root.
     *
     * @type {TaskSource}
     * @memberOf KarmaSystemjsOption
     */
    resource?: TaskSource;
    /**
     * load test files.
     *
     * @type {TaskSource}
     * @memberOf KarmaSystemjs
     */
    loadFiles?: LoaderFilePattern;
    /**
     * server files.
     *
     * @type {TaskSource}
     * @memberOf KarmaSystemjs
     */
    serveFiles?: LoaderFilePattern;
    /**
     * need jspm ^0.17
     *
     * @type {TaskString}
     * @memberOf KarmaSystemjs
     */
    browser?: TaskString;
    paths?: IMap<string>;
    meta?: IMap<ISystemjsMate>;
    useBundles?: boolean;
    stripExtension?: string | boolean;
    cachePackages?: boolean;
    karmaloader?: {
        name: string;
        template: string;
    };
}
export interface IBrowsersyncOption extends Options {
    /**
     * server load files.
     *
     * @type {(string[] | ((ctx: ITaskContext) => string[]))}
     * @memberOf IWebTaskOption
     */
    files?: string | (string | FileCallback)[];
    /**
     * get files by context.
     */
    filesByCtx?: ((ctx: ITaskContext) => string | (string | FileCallback)[]);
    /**
     * server base dir.
     *
     * @type {TaskSource}
     * @memberOf IWebTaskOption
     */
    baseDir?: TaskSource;
    /**
     * systemjs option.
     *
     * @type {SystemjsOption}
     * @memberof IBrowsersyncOption
     */
    systemjs?: SystemjsOption;
}
export interface IKarmaOption {
    /**
     * karma jspm  test
     *
     * @memberOf IWebTaskOption
     */
    systemjs?: boolean | KarmaSystemjsOption | ((ctx: ITaskContext) => KarmaSystemjsOption);
    /**
     * karma test base path.  default context dist.
     *
     * @type {TaskString}
     * @memberOf IWebTaskOption
     */
    basePath?: TaskString;
    /**
     * karma config File
     *
     * @type {string}
     * @memberOf WebTaskOption
     */
    configFile?: string;
    /**
     * karma test config setting.
     * @type {((ctx: ITaskContext) => karmaConfig)}
     *
     * @memberOf IWebTaskOption
     */
    config?: ((ctx: ITaskContext) => karma.ConfigOptions);
}
export interface IWebTaskOption extends IAssertOption {
    browsersync?: IBrowsersyncOption;
    karma?: IKarmaOption;
    /**
     * force test
     */
    forceTest?: boolean;
    test?: boolean;
    testOrder?: Order;
}
