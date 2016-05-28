import 'reflect-metadata';
import 'ts-helpers';
import { Kernel } from 'inversify';
import ConfigManager from './config';
import SyncImpl, {Sync, Exec} from './sync';
import WatchmanSyncImpl, { Watchman } from './watchman';
import * as proc from 'child_process';
import TerminalImpl, {Terminal} from './terminal';
import { Config } from '../lib/config';
const emoji = require('node-emoji') as Emoji;
const chalk = require('chalk') as Chalk;
const watchman = require('fb-watchman');

const configManager = new ConfigManager();

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const kernel = new Kernel();
  const config = configManager.getConfig();

  kernel.bind('WatchmanClient').toConstantValue(new watchman.Client);
  kernel.bind<Config>('Config').toConstantValue(config);
  kernel.bind<Exec>('Exec').toConstantValue(proc.exec);
  kernel.bind('stdErrWrite').toConstantValue(stdErrWriteImpl);
  kernel.bind('stdOutWrite').toConstantValue(stdOutWriteImpl);
  kernel.bind<Emoji>('Emoji').toConstantValue(emoji);
  kernel.bind<Chalk>('Chalk').toConstantValue(chalk);
  kernel.bind<Terminal>('Terminal').to(TerminalImpl);
  kernel.bind<Sync>('Sync').to(SyncImpl);
  kernel.bind<Watchman>('WatchmanSync').to(WatchmanSyncImpl);

  const watchmanSync = kernel.get<Watchman>('WatchmanSync');
  watchmanSync.start();

  exports = watchmanSync;
}

function stdErrWriteImpl(msg: string) {
  process.stderr.write(msg);
}

function stdOutWriteImpl(msg: string) {
  process.stdout.write(msg);
}
