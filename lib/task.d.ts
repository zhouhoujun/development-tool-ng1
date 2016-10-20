/// <reference types="gulp" />
/// <reference types="mocha" />
import { WatchEvent } from 'gulp';
import { Src, IMap, TaskConfig, TaskOption, ITaskDefine } from 'development-tool';
export interface Ng1BuildOption extends TaskOption {
    test?: Src;
    tsconfig?: string;
    ts?: Src;
    tsWatchChanged?(config: TaskConfig, event: WatchEvent): void;
    mochaOptions?: MochaSetupOptions;
    asserts?: IMap<Src>;
    assertWatchChanged?(assert: string, config: TaskConfig, event: WatchEvent): void;
}
declare var _default: ITaskDefine;
export default _default;
