var config = require('./built/init');
if (config) {
  var chalk = require('chalk');
  var emoji = require('node-emoji');
  var proc = require('child_process');
  var exec = proc.exec;
  var watchman = require('fb-watchman');
  var Terminal = require('./built/terminal').default;
  var Sync = require('./built/sync').default;
  var WatchmanSync = require('./built/watchman').default;

  var client = new watchman.Client();
  var terminal = new Terminal(config, stdOutWrite, stdErrWrite, chalk, emoji);
  var sync = new Sync(config, terminal, exec);

  var watchmanSync = new WatchmanSync(config, client, terminal, sync);
  watchmanSync.start();

  module.exports = watchmanSync;
}

function stdErrWrite(msg) {
  process.stderr.write(msg);
}

function stdOutWrite(msg) {
  process.stdout.write(msg);
}