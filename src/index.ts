import ConfigManager from './config';
import Terminal from './terminal';
import Sync from './sync';
import WatchmanSync from './watchman';
import * as proc from 'child_process';

const configManager = new ConfigManager();

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const emoji = require('emoji') as Emoji;
  const chalk = require('chalk') as Chalk;
  const watchman = require('fb-watchman');

  const config = configManager.getConfig();
  const client = new watchman.Client();
  const terminal = new Terminal(config, stdOutWrite, stdErrWrite, chalk, emoji);
  const sync = new Sync(config, terminal, proc.exec);

  const watchmanSync = new WatchmanSync(config, client, terminal, sync);
  watchmanSync.start();

  exports = watchmanSync;
}

function stdErrWrite(msg: string) {
  process.stderr.write(msg);
}

function stdOutWrite(msg: string) {
  process.stdout.write(msg);
}
