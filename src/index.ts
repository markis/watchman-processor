import ConfigManager from './config';
import Terminal from './terminal';
import Sync from './sync';
import WatchmanSync from './watchman';

const configManager = new ConfigManager();

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const chalk = require('chalk');
  const emoji = require('node-emoji');
  const proc = require('child_process');
  const watchman = require('fb-watchman');

  const config = configManager.getConfig();
  const client = new watchman.Client();
  const terminal = new Terminal(config, stdOutWrite, stdErrWrite, chalk, emoji);
  const sync = new Sync(config, terminal, proc.exec);

  const watchmanSync = new WatchmanSync(config, client, terminal, sync);
  watchmanSync.start();

  exports = watchmanSync; 
}

function stdErrWrite(msg) {
  process.stderr.write(msg);
}

function stdOutWrite(msg) {
  process.stdout.write(msg);
}