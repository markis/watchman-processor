const path = require('path');

const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const WATCH_EXPRESSION = ['allof', ['type', 'f'],
  ['not', ['dirname', '.git']],
  ['not', ['dirname', '.idea']]
];

module.exports = {
  debug: false,           // changes the output to show debug information, cmd and stdout output
  emoji: true,            // if your terminal window can support emojis
  rsyncCmd: 'rsync',      // default: 'rsync' -- override to whatever rsync command is installed or located
  subscriptions: {
    example1: {
      type: 'rsync',      // set the subscription to rsync files from a 'source' folder to 'destination' folder

      // source folder to sync
      source: path.join(HOME_FOLDER, '/tmp/example1/'),

      // destination to sync, could be local or server location.  Any supported rsync location.
      destination: 'user@server:/tmp/example1/',

      // Watchman file query expresion: https://facebook.github.io/watchman/docs/file-query.html
      // Default: ['allof', ['type', 'f']]
      watchExpression: WATCH_EXPRESSION
    },
    example2: {
      type: 'rsync',
      source: path.join(HOME_FOLDER, '/tmp/example2/'),
      destination: 'user@server:/tmp/example2/',
      watchExpression: WATCH_EXPRESSION
    }
  }
};