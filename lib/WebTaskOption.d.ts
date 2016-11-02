/// <reference types="browser-sync" />
import { ITaskOption } from 'development-core';
import { Options } from 'browser-sync';
export interface IWebTaskOption extends ITaskOption {
    browsersync?: Options;
    karmaConfigFile?: string;
    protractorFile?: string;
    tsconfig?: string;
    tsBabelOption?: any;
    jsBabelOption?: any;
}
