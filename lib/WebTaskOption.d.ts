/// <reference types="browser-sync" />
/// <reference types="chai" />
import { IAsserts } from 'development-core';
import { Options } from 'browser-sync';
export interface IWebTaskOption extends IAsserts {
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
     * karma test config setting.
     *
     *
     * @memberOf IWebTaskOption
     */
    karmaConfig?: ((ctx) => Object);
}
