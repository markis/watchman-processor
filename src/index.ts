import * as chalk from 'chalk';
import * as proc from 'child_process';
import * as watchman from 'fb-watchman';
import { Container } from 'inversify';
import * as emoji from 'node-emoji';
import 'reflect-metadata';
import * as interfaces from '../interfaces';
import ConfigManager from './config';
import SyncImpl from './sync';
import TerminalImpl, { StdErrWriteImpl, StdOutWriteImpl } from './terminal';
import WatchmanSyncImpl from './watchman';

const configManager = new ConfigManager({}, require, StdOutWriteImpl);
let watchmanSync: interfaces.WatchmanSync;

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
    container.bind<interfaces.Spawn>('spawn').toConstantValue(proc.spawn);
    container.bind<NodeRequire>('require').toConstantValue(require);
    container.bind<WatchmanClient>('WatchmanClient').toConstantValue(new watchman.Client());
    container.bind<interfaces.Config>('Config').toConstantValue(config);
    container.bind<interfaces.Write>('stdErrWrite').toConstantValue(StdErrWriteImpl);
    container.bind<interfaces.Write>('stdOutWrite').toConstantValue(StdOutWriteImpl);
    container.bind<Emoji>('Emoji').toConstantValue(emoji);
    container.bind('Chalk').toConstantValue(chalk);
    container.bind<interfaces.Terminal>('Terminal').to(TerminalImpl);
    container.bind<interfaces.Sync>('Sync').to(SyncImpl);
    container.bind<interfaces.WatchmanSync>('WatchmanSync').to(WatchmanSyncImpl);
  }
  return container;
}

function getWatchmanSync(container: Container): interfaces.WatchmanSync {
  return container.get<interfaces.WatchmanSync>('WatchmanSync');
}

export default watchmanSync;
