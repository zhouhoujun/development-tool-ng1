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

export type FilePattern = karma.FilePattern | string;
export type LoaderFilePattern = FilePattern[] | ((ctx: ITaskContext) => FilePattern[]);

/**
 * karma jspm test config.
 * 
 * @export
 * @interface KarmaJspm
 */
export interface KarmaJspm {
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
    loadFiles?: FilePattern[]
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
export interface KarmaJspmOption {
    /**
     * baseURL for test path.
     * 
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    baseURL?: TaskString;
    /**
     * config file. default use package setting.
     * 
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    config?: TaskSource;
    /**
     * jspm package path. default use package setting.
     * 
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    packages?: TaskString;
    /**
     * load test files.
     * 
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    loadFiles?: LoaderFilePattern
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
    }
}

export interface IWebTaskOption extends IAsserts {
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
    serverFiles?: string[] | ((ctx: ITaskContext) => string[]);

    /**
     * server base dir.
     * 
     * @type {TaskSource}
     * @memberOf IWebTaskOption
     */
    serverBaseDir?: TaskSource;


    /**
     * karma test base path.  default context dist.
     * 
     * @type {TaskString}
     * @memberOf IWebTaskOption
     */
    karmaBasePath?: TaskString;
    /**
     * karma config File
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    karmaConfigFile?: string;

    /**
     * karma test config setting.
     * @type {((ctx: ITaskContext) => karmaConfig)}
     * 
     * @memberOf IWebTaskOption
     */
    karmaConfig?: ((ctx: ITaskContext) => karma.ConfigOptions);

    /**
     * karma jspm  test
     * 
     * 
     * @memberOf IWebTaskOption
     */
    karmaJspm?: KarmaJspmOption | ((ctx: ITaskContext) => KarmaJspmOption);

}

