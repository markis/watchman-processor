var path = require('path');

var HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const IGNORE_FOLDERS = ['.git', 'node_modules'];

module.exports = {
  debug: false,           // changes the output to show debug information, cmd and stdout output
  emoji: true,            // if your terminal window can support emojis
  controlWatchman: true,  // this will tell watchman-processor to shutdown watchman, when quitting
  rsyncCmd: 'rsync',      // default: 'rsync' -- override to whatever rsync command is installed or located
  subscriptions: {
    example1: {
      type: 'rsync',      // set the subscription to rsync files from a 'source' folder to 'destination' folder

      // source folder to sync
      source: path.join(HOME_FOLDER, '/tmp/example1/'),

      // destination to sync, could be local or server location.  Any supported rsync location.
      destination: 'user@server:/tmp/example1/',

      // relative paths to ignore from watchman and rsync
      ignoreFolders: IGNORE_FOLDERS
    },
    example2: {
      type: 'rsync',
      source: path.join(HOME_FOLDER, '/tmp/example2/'),
      destination: 'user@server:/tmp/example2/',
      ignoreFolders: IGNORE_FOLDERS
    }
  }
};