import 'reflect-metadata';
import { Kernel } from 'inversify';
import ConfigManager, { Config } from './config';
import TerminalImpl, {Terminal} from './terminal';
import SyncImpl, { Sync, Exec } from './sync';
import WatchmanSyncImpl, { Watchman } from './watchman';
import * as proc from 'child_process';
import * as chalk from 'chalk';
import * as emoji from 'node-emoji';
import * as watchman from 'fb-watchman';

const configManager = new ConfigManager();
let watchmanSync: Watchman;

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const kernel = new Kernel();
  const config = configManager.getConfig();

  kernel.bind<WatchmanClient>('WatchmanClient').toConstantValue(new watchman.Client);
  kernel.bind<Config>('Config').toConstantValue(config);
  kernel.bind<Exec>('Exec').toConstantValue(proc.exec);
  kernel.bind('stdErrWrite').toConstantValue(stdErrWriteImpl);
  kernel.bind('stdOutWrite').toConstantValue(stdOutWriteImpl);
  kernel.bind<Emoji>('Emoji').toConstantValue(emoji);
  kernel.bind<Chalk>('Chalk').toConstantValue(chalk);
  kernel.bind<Terminal>('Terminal').to(TerminalImpl);
  kernel.bind<Sync>('Sync').to(SyncImpl);
  kernel.bind<Watchman>('WatchmanSync').to(WatchmanSyncImpl);

  watchmanSync = kernel.get<Watchman>('WatchmanSync');
  watchmanSync.start();
}

function stdErrWriteImpl(msg: string) {
  process.stderr.write(msg);
}

function stdOutWriteImpl(msg: string) {
  process.stdout.write(msg);
}

export default watchmanSync;
