var chalk = require('chalk');
var emoji = require('node-emoji');

function Terminal(config, _stdOutWrite, _stdErrWrite, _chalk, _emoji) {
  this.config = config;
  if (!config || !config.debug) {
    this.debug = function noop() {};
  }

  this.error = _stdErrWrite || stdErrWrite;
  this.write = _stdOutWrite || stdOutWrite;
  this.chalk = _chalk || chalk;
  this.emoji = _emoji || emoji;
}

Terminal.prototype.error = function error(err) {
  this.error(this.chalk.red(err));
};

Terminal.prototype.start = function start() {
  this.debug('starting');
  if (!this.config || !this.config.debug) {
    this.enableFullScreen();
    this.hideCursor();
  }
};

Terminal.prototype.clear = function clear() {
  this.write('\x1b[H\x1b[J');
};

Terminal.prototype.enableFullScreen = function enableFullScreen() {
  this.write('\x1b[?1049h');
  this.clear();
};

Terminal.prototype.hideCursor = function hideCursor() {
  this.write('\x1B[?25l'); // Hide terminal cursor
};

// Terminal.prototype.showCursor = function showCursor() {
//   this.write('\x1B[?25h'); // Show terminal cursor
// };

Terminal.prototype.debug = function debug(msg) {
  if (this.config.debug && msg) {
    this.write(this.chalk.white(msg + '\n'));
  }
};

Terminal.prototype.emojify = function emojify(msg) {
  if (this.config.emoji) {
    return this.emoji.emojify(msg);
  }
  return msg;
};

Terminal.prototype.setState = function setState(configEntry, state, statusMessage) {
  configEntry.state = state;
  configEntry.statusMessage = statusMessage;
  this.render();
};

Terminal.prototype.render = function render() {
  if (this.config.debug) {
    return;
  }
  this.clear();
  var subscriptions = Object.keys(this.config.subscriptions);
  for (var i = 0; i < subscriptions.length; i++) {
    var name = subscriptions[i],
      subscription = this.config.subscriptions[name];
    if (subscription) {
      var state = subscription.state;
      if (state === 'good') {
        this.log(':thumbsup:  ' + name + ' ', 'Green');
      } else if (state === 'running') {
        this.log(':running:  ' + name + ' ', 'Yellow');
      } else if (state === 'error') {
        this.log(':skull_and_crossbones:  ' + name + ' ', 'Red');
      } else {
        this.log(':hourglass:  ' + name + ' ');
      }
    }
  }
  this.log('\n');
};

Terminal.prototype.log = function log(msg, color) {
  msg = this.emojify(msg);
  if (this.chalk['bg' + color]) {
    msg = this.chalk['bg' + color].black(msg); 
  } else {
    msg = this.chalk.bgWhite.black(msg);
  }
  this.write(msg);
};

function stdErrWrite(msg) {
  process.stderr.write(msg);
}

function stdOutWrite(msg) {
  process.stdout.write(msg);
}

module.exports = Terminal;
