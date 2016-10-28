# Watchman-Processor

[![Dependency Status](https://david-dm.org/markis/watchman-processor.svg)](https://david-dm.org/markis/watchman-processor)
[![Code Climate](https://codeclimate.com/github/markis/watchman-processor/badges/gpa.svg)](https://codeclimate.com/github/markis/watchman-processor)
[![Build Status](https://travis-ci.org/markis/watchman-processor.svg?branch=master)](https://travis-ci.org/markis/watchman-processor)
[![Coverage Status](https://coveralls.io/repos/github/markis/watchman-processor/badge.svg?branch=master)](https://coveralls.io/github/markis/watchman-processor?branch=master)

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
