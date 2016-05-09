const config = require('./src/init');
if (config) {
  const watchman = require('fb-watchman');
  const Terminal = require('./src/terminal');
  const Sync = require('./src/sync');
  const WatchmanSync = require('./src/watchman');

  const client = new watchman.Client();
  const terminal = new Terminal(config);
  const sync = new Sync(config, terminal);

  const watchmanSync = new WatchmanSync(config, client, terminal, sync);
  watchmanSync.start();

  module.exports = watchmanSync;
}
