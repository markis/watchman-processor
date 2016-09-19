import 'reflect-metadata';
import { Kernel } from 'inversify';

import * as chalk from 'chalk';
import * as emoji from 'node-emoji';
import * as watchman from 'fb-watchman';
import * as proc from 'child_process';

import ConfigManager, { Config } from './config';
import TerminalImpl, { Terminal, Write, StdErrWriteImpl, StdOutWriteImpl } from './terminal';
import SyncImpl, { Sync, Spawn } from './sync';
import WatchmanSyncImpl, { WatchmanSync } from './watchman';

const configManager = new ConfigManager({}, require, StdOutWriteImpl);
let watchmanSync: WatchmanSync;

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const kernel = new Kernel();
  const config = configManager.getConfig();
  if (config) {
    setupKernel(kernel);
    watchmanSync = getWatchmanSync(kernel);
  } else {
    StdErrWriteImpl('The watchman-processor configuration does not exist. \n\n' +
      'Run "watchman-processor init" to create an example configuration file.\n');
  }
}

function setupKernel(kernel: Kernel): Kernel {
  const config = configManager.getConfig();
  if (config) {
    kernel.bind<Spawn>('spawn').toConstantValue(proc.spawn);
    kernel.bind<NodeRequire>('require').toConstantValue(require);
    kernel.bind<WatchmanClient>('WatchmanClient').toConstantValue(new watchman.Client());
    kernel.bind<Config>('Config').toConstantValue(config);
    kernel.bind<Write>('stdErrWrite').toConstantValue(StdErrWriteImpl);
    kernel.bind<Write>('stdOutWrite').toConstantValue(StdOutWriteImpl);
    kernel.bind<Emoji>('Emoji').toConstantValue(emoji);
    kernel.bind('Chalk').toConstantValue(chalk);
    kernel.bind<Terminal>('Terminal').to(TerminalImpl);
    kernel.bind<Sync>('Sync').to(SyncImpl);
    kernel.bind<WatchmanSync>('WatchmanSync').to(WatchmanSyncImpl);
  }
  return kernel;
}

function getWatchmanSync(kernel: Kernel): WatchmanSync {
  return kernel.get<WatchmanSync>('WatchmanSync');

}

export default watchmanSync;
