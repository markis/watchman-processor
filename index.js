var config = require('./src/init');
if (config) {
  var watchman = require('fb-watchman');
  var Terminal = require('./src/terminal');
  var Sync = require('./src/sync');
  var WatchmanSync = require('./src/watchman');

  var client = new watchman.Client();
  var terminal = new Terminal(config);
  var sync = new Sync(config, terminal);

  var watchmanSync = new WatchmanSync(config, client, terminal, sync);
  watchmanSync.start();

  module.exports = watchmanSync;
}
