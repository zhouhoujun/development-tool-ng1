import { ITaskOption } from 'development-core';
import { Options } from 'browser-sync';

export interface IWebTaskOption extends ITaskOption {
    /**
     * browser setting
     * 
     * @type {Options}
     * @memberOf WebTaskOption
     */
    browsersync?: Options;
    /**
     * karma config File
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    karmaConfigFile?: string;

    /**
     * e2e test protractor config file
     * 
     * @type {string}
     * @memberOf WebTaskOption
     */
    protractorFile?: string;

    /**
     * tsconfig for typescript
     * 
     * @type {string}
     * @memberOf NodeBuildOption
     */
    tsconfig?: string;


    /**
     * babel option.
     * 
     * @type {*}
     * @memberOf INodeTaskOption
     */
    tsBabelOption?: any;

    /**
     * babel option.
     * 
     * @type {*}
     * @memberOf INodeTaskOption
     */
    jsBabelOption?: any;

}

