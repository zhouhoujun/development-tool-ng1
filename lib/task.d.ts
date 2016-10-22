/// <reference types="browser-sync" />
/// <reference types="gulp" />
import { WatchEvent } from 'gulp';
import { Src, Asserts, IMap, TaskConfig, TaskOption, ITaskDefine } from 'development-tool';
import { Options } from 'browser-sync';
export interface WebTaskOption extends TaskOption {
    browsersync?: Options;
    karmaConfigFile?: string;
    protractorFile?: string;
    test?: Src;
    e2e?: Src;
    tsconfig?: string;
    ts?: Src;
    tsWatchChanged?(config: TaskConfig, event: WatchEvent): void;
    asserts?: IMap<Src | Asserts>;
    assertWatchChanged?(assert: string, config: TaskConfig, event: WatchEvent): void;
}
declare var _default: ITaskDefine;
export default _default;
