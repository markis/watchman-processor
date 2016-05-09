const chalk = require('chalk');
const emoji = require('node-emoji');

function Terminal(config, _chalk, _emoji) {
  this.config = config;
  if (!config.debug) {
    this.debug = function noop() {};
  }
  
  this.chalk = _chalk || chalk;
  this.emoji = _emoji || emoji;
}

Terminal.prototype.error = function error(err) {
  console.error(this.chalk.red(err));
};

Terminal.prototype.start = function start() {
  this.debug('starting');
  if (!this.config.debug) {
    this.enableFullScreen();
    this.hideCursor();
  }
};

Terminal.prototype.clear = function clear() {
  process.stdout.write('\x1b[H\x1b[J');
};

Terminal.prototype.enableFullScreen = function enableFullScreen() {
  process.stdout.write('\x1b[?1049h');
  this.clear();
};

Terminal.prototype.hideCursor = function hideCursor() {
  process.stdout.write('\x1B[?25l'); // Hide terminal cursor
};

Terminal.prototype.showCursor = function showCursor() {
  process.stdout.write('\x1B[?25h'); // Show terminal cursor
};

Terminal.prototype.debug = function debug(msg) {
  if (this.config.debug && msg) {
    process.stdout.write(this.chalk.white(msg + '\n'));
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
        process.stdout.write(this.chalk.bgGreen.black(this.emojify(':thumbsup:  ' + name + ' ')));
      } else if (state === 'running') {
        process.stdout.write(this.chalk.bgYellow.black(this.emojify(':running:  ' + name + ' ')));
      } else if (state === 'error') {
        process.stdout.write(this.chalk.bgRed.black(this.emojify(':skull_and_crossbones:  ' + name + ' ')));
      } else {
        process.stdout.write(this.chalk.bgWhite.black(this.emojify(':hourglass:  ' + name + ' ')));
      }
    }
  }
  console.log(this.chalk.bgBlack.white(' '));
};

module.exports = Terminal;
