/// <reference types="karma" />
/// <reference types="browser-sync" />
import { Src, IAsserts, ITaskContext, TaskSource, TaskString, IMap } from 'development-core';
import { Options } from 'browser-sync';
import * as karma from 'karma';
/**
 * jspm mate.
 *
 * @export
 * @interface IJspmMate
 */
export interface IJspmMate {
    loader: string;
}
export declare type FilePattern = karma.FilePattern | string;
export declare type LoaderFilePattern = FilePattern[] | ((ctx: ITaskContext) => FilePattern[]);
/**
 * jspm Option.
 *
 * @export
 * @interface JspmOption
 */
export interface JspmOption {
    /**
      * baseURL for test path.
      *
      * @type {TaskString}
      * @memberOf JspmOption
      */
    baseURL?: TaskString;
    /**
     * config file. default use package setting.
     *
     * @type {TaskSource}
     * @memberOf JspmOption
     */
    config?: TaskSource;
    /**
     * jspm package path. default use package setting.
     *
     * @type {TaskString}
     * @memberOf JspmOption
     */
    packages?: TaskString;
}
/**
 * karma jspm test config.
 *
 * @export
 * @interface KarmaJspm
 */
export interface KarmaJspm extends JspmOption {
    /**
     * baseURL for test path.
     *
     * @type {string}
     * @memberOf KarmaJspm
     */
    baseURL?: string;
    /**
     * config file. default use package setting.
     *
     * @type {Src}
     * @memberOf KarmaJspm
     */
    config?: Src;
    /**
     * jspm package path. default use package setting.
     *
     * @type {string}
     * @memberOf KarmaJspm
     */
    packages?: string;
    /**
     * load test files.
     *
     * @type {FilePattern[]}
     * @memberOf KarmaJspm
     */
    loadFiles?: FilePattern[];
    /**
     * server files.
     *
     * @type {FilePattern[]}
     * @memberOf KarmaJspm
     */
    serveFiles?: FilePattern[];
    /**
     * need jspm ^0.17
     *
     * @type {string}
     * @memberOf KarmaJspm
     */
    browser?: string;
    paths?: IMap<string>;
    meta?: IMap<IJspmMate>;
    useBundles?: boolean;
    stripExtension?: string | boolean;
    cachePackages?: boolean;
}
/**
 * karma jspm test config.
 *
 * @export
 * @interface KarmaJspm
 */
export interface KarmaJspmOption extends JspmOption {
    /**
     * load test files.
     *
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    loadFiles?: LoaderFilePattern;
    /**
     * server files.
     *
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    serveFiles?: LoaderFilePattern;
    /**
     * need jspm ^0.17
     *
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    browser?: TaskString;
    paths?: IMap<string>;
    meta?: IMap<IJspmMate>;
    useBundles?: boolean;
    stripExtension?: string | boolean;
    cachePackages?: boolean;
    karmaloader?: {
        name: string;
        template: string;
    };
}
export interface IBrowsersyncOption {
    /**
    * browser server setting
    * @type {(Options | ((ctx: ITaskContext, defaultOptions?: Option) => Options))}
    * @memberOf IWebTaskOption
    */
    browsersync?: Options | ((ctx: ITaskContext, defaultOptions?: Options) => Options);
    /**
     * server load files.
     *
     * @type {(string[] | ((ctx: ITaskContext) => string[]))}
     * @memberOf IWebTaskOption
     */
    files?: string[] | ((ctx: ITaskContext) => string[]);
    /**
     * server base dir.
     *
     * @type {TaskSource}
     * @memberOf IWebTaskOption
     */
    baseDir?: TaskSource;
    jspm?: JspmOption;
}
export interface IKarmaOption {
    /**
     * karma jspm  test
     *
     *
     * @memberOf IWebTaskOption
     */
    jspm?: boolean | KarmaJspmOption | ((ctx: ITaskContext) => KarmaJspmOption);
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
export interface IWebTaskOption extends IAsserts {
    browsersync?: IBrowsersyncOption;
    karma?: IKarmaOption;
}
