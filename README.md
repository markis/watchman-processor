# Watchman-Processor


[![Code Climate](https://codeclimate.com/github/markis/watchman-processor/badges/gpa.svg)](https://codeclimate.com/github/markis/watchman-processor)
[![Build Status](https://travis-ci.org/markis/watchman-processor.svg?branch=master)](https://travis-ci.org/markis/watchman-processor)
[![Coverage Status](https://coveralls.io/repos/github/markis/watchman-processor/badge.svg?branch=master)](https://coveralls.io/github/markis/watchman-processor?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/markis/watchman-processor/badge.svg)](https://snyk.io/test/github/markis/watchman-processor)

File synchronizer with a simplistic dashboard for Facebook's watchman file watching service

![Screencapture GIF](https://i.imgur.com/1p0i8d6.gif)

### About

Watchman-Processor can monitor a folder and synchronize file changes to another folder.  The other folder could be local or remote.  Watchman-Processor is simply the glue between watchman and rsync.

### Installation

Install [Facebook Watchman](https://facebook.github.io/watchman/docs/install.html)

```bash
brew update
brew install watchman
```

Install watchman-processor

```bash
npm install watchman-processor -g
```

Create configuration file

```bash
watchman-processor --init
```

Setup configuration file

```bash
open ~/.watchman-processor.config.js
```

### Configuration
The following is an example `.watchman-processor.config.js` file with comments about the different settings available

```javascript
var path = require('path');

var HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const IGNORE_FOLDERS = ['.git', 'node_modules'];

module.exports = {
  debug: false,           // changes the output to show debug information, cmd and stdout output
  syncDelete: true,       // delete extraneous files from destination
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
```
