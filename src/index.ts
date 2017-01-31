import 'reflect-metadata';

import { Container } from 'inversify';

import * as chalk from 'chalk';
import * as proc from 'child_process';
import * as watchman from 'fb-watchman';
import * as emoji from 'node-emoji';

import ConfigManager, { Config } from './config';
import SyncImpl, { Spawn, Sync } from './sync';
import TerminalImpl, { StdErrWriteImpl, StdOutWriteImpl, Terminal, Write } from './terminal';
import WatchmanSyncImpl, { WatchmanSync } from './watchman';

const configManager = new ConfigManager({}, require, StdOutWriteImpl);
let watchmanSync: WatchmanSync;

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const container = new Container();
  const config = configManager.getConfig();
  if (config) {
    setupKernel(container);
    watchmanSync = getWatchmanSync(container);
  } else {
    StdErrWriteImpl('The watchman-processor configuration does not exist. \n\n' +
      'Run "watchman-processor init" to create an example configuration file.\n');
  }
}

function setupKernel(container: Container): Container {
  const config = configManager.getConfig();
  if (config) {
    container.bind<Spawn>('spawn').toConstantValue(proc.spawn);
    container.bind<NodeRequire>('require').toConstantValue(require);
    container.bind<WatchmanClient>('WatchmanClient').toConstantValue(new watchman.Client());
    container.bind<Config>('Config').toConstantValue(config);
    container.bind<Write>('stdErrWrite').toConstantValue(StdErrWriteImpl);
    container.bind<Write>('stdOutWrite').toConstantValue(StdOutWriteImpl);
    container.bind<Emoji>('Emoji').toConstantValue(emoji);
    container.bind('Chalk').toConstantValue(chalk);
    container.bind<Terminal>('Terminal').to(TerminalImpl);
    container.bind<Sync>('Sync').to(SyncImpl);
    container.bind<WatchmanSync>('WatchmanSync').to(WatchmanSyncImpl);
  }
  return container;
}

function getWatchmanSync(container: Container): WatchmanSync {
  return container.get<WatchmanSync>('WatchmanSync');
}

export default watchmanSync;
