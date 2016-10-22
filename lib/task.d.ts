/// <reference types="gulp" />
import { WatchEvent } from 'gulp';
import { Src, Asserts, IMap, TaskConfig, TaskOption, ITaskDefine } from 'development-tool';
export interface WebTaskOption extends TaskOption {
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
