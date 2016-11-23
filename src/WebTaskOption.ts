import { IAsserts, ITaskContext } from 'development-core';
import { Options } from 'browser-sync';

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
     * @type {(string | ((ctx: ITaskContext) => string))}
     * @memberOf IWebTaskOption
     */
    serverBaseDir?: string | ((ctx: ITaskContext) => string);
    /**
     * karma config File
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    karmaConfigFile?: string;

    /**
     * karma test config setting.
     * @type {((ctx: ITaskContext) => Object)}
     * 
     * @memberOf IWebTaskOption
     */
    karmaConfig?: ((ctx: ITaskContext) => Object);

    // /**
    //  * e2e test protractor config file
    //  * 
    //  * @type {string}
    //  * @memberOf WebTaskOption
    //  */
    // protractorFile?: string;

}

