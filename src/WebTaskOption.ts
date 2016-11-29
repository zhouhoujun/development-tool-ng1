import { IAsserts, ITaskContext, TaskSource, TaskString } from 'development-core';
import { Options } from 'browser-sync';
import * as karam from 'karma';

/**
 * karam jspm test config.
 * 
 * @export
 * @interface KarmaJspm
 */
export interface KarmaJspm {
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
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    configFile?: TaskString;
    /**
     * jspm package path. default use package setting.
     * 
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    jspmPackage?: TaskString;
    /**
     * load test files.
     * 
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    testFiles: TaskSource;
    /**
     * server files.
     * 
     * @type {TaskSource}
     * @memberOf KarmaJspm
     */
    serveFiles: TaskSource;
    /**
     * need jspm ^0.17 
     * 
     * @type {TaskString}
     * @memberOf KarmaJspm
     */
    browser?: TaskString;
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
     * karam test base path.  default context dist.
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
    karmaConfig?: ((ctx: ITaskContext) => karam.ConfigOptions);

    /**
     * karam jspm  test
     * 
     * 
     * @memberOf IWebTaskOption
     */
    karamjspm?: KarmaJspm | ((ctx: ITaskContext) => KarmaJspm);

}

