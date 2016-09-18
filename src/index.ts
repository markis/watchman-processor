import 'reflect-metadata';
import { Kernel } from 'inversify';
import ConfigManager, { Config } from './config';
import TerminalImpl, {Terminal} from './terminal';
import SyncImpl, { Sync } from './sync';
import WatchmanSyncImpl, { Watchman } from './watchman';
import * as chalk from 'chalk';
import * as emoji from 'node-emoji';
import * as watchman from 'fb-watchman';
import * as proc from 'child_process';

const configManager = new ConfigManager();
let watchmanSync: Watchman;

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const 
    kernel = new Kernel(),
    config = configManager.getConfig();

  kernel.bind('spawn').toConstantValue(proc.spawn);
  kernel.bind('require').toConstantValue(require);
  kernel.bind<WatchmanClient>('WatchmanClient').toConstantValue(new watchman.Client);
  kernel.bind<Config>('Config').toConstantValue(config);
  kernel.bind('stdErrWrite').toConstantValue(stdErrWriteImpl);
  kernel.bind('stdOutWrite').toConstantValue(stdOutWriteImpl);
  kernel.bind<Emoji>('Emoji').toConstantValue(emoji);
  kernel.bind('Chalk').toConstantValue(chalk);
  kernel.bind<Terminal>('Terminal').to(TerminalImpl);
  kernel.bind<Sync>('Sync').to(SyncImpl);
  kernel.bind<Watchman>('WatchmanSync').to(WatchmanSyncImpl);
  
  watchmanSync = kernel.get<Watchman>('WatchmanSync');
  watchmanSync.start();
}

/**
 * Wraps process.stderr.write, so that we can mock this method in tests 
 * 
 * @param {string} msg
 */
function stdErrWriteImpl(msg: string) {
  process.stderr.write(msg);
}

/**
 * Wraps process.stdout.write, so that we mock this method in tests
 * 
 * @param {string} msg
 */
function stdOutWriteImpl(msg: string) {
  process.stdout.write(msg);
}

export default watchmanSync;
