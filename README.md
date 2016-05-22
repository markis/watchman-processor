# Watchman-Processor

[![Dependency Status](https://david-dm.org/markistaylor/watchman-processor.svg)](https://david-dm.org/markistaylor/watchman-processor)
[![Code Climate](https://codeclimate.com/github/markistaylor/watchman-processor/badges/gpa.svg)](https://codeclimate.com/github/markistaylor/watchman-processor)
[![Build Status](https://travis-ci.org/markistaylor/watchman-processor.svg?branch=master)](https://travis-ci.org/markistaylor/watchman-processor)

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
watchman-processor init
```

Setup configuration file

```bash
open ~/.watchman-processor.config.js
```
