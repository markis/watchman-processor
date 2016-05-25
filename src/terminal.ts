import {Config, SubConfig} from '../lib/config';

export interface Terminal {
  start();
  error(err: string | Error);
  debug(msg: string);
  setState(configEntry: SubConfig, state: string, statusMessage?: string)
  render();
}

export default class TerminalImpl implements Terminal {
  private _config;
  private _error;
  private _write;
  private _chalk;
  private _emoji;
  
  constructor(config: Config, stdOutWrite, stdErrWrite, chalk: any, emoji: any) {
    this._config = config || {};
    this._error = stdErrWrite;
    this._write = stdOutWrite;
    this._chalk = chalk;
    this._emoji = emoji;
  }
  
  error(err: string | Error) {
    this.error(this._chalk.red(err));
  }
  
  start() {
    this.debug('starting');
    if (!this._config.debug) {
      this._enableFullScreen();
      this._hideCursor();
    }
  }
  
  debug(msg: string) {
    if (this._config.debug && msg) {
      this._write(this._chalk.white(msg + '\n'));
    }
  }
  
  setState(configEntry: SubConfig, state: string, statusMessage?: string) {
    configEntry.state = state;
    configEntry.statusMessage = statusMessage;
    this.render();
  }
  
  render() {
    if (this._config && this._config.debug) {
      return;
    }
    this._clear();
    var subscriptions = Object.keys(this._config.subscriptions);
    for (var i = 0; i < subscriptions.length; i++) {
      var name = subscriptions[i],
        subscription = this._config.subscriptions[name];
      if (subscription) {
        var state = subscription.state;
        if (state === 'good') {
          this._log(':thumbsup:  ' + name + ' ', 'Green');
        } else if (state === 'running') {
          this._log(':running:  ' + name + ' ', 'Yellow');
        } else if (state === 'error') {
          this._log(':skull_and_crossbones:  ' + name + ' ', 'Red');
        } else {
          this._log(':hourglass:  ' + name + ' ');
        }
      }
    }
    this._log('\n');
  }
  
  private _clear() {
    this._write('\x1b[H\x1b[J');
  }
  
  private _enableFullScreen() {
    this._write('\x1b[?1049h');
    this._clear();
  }
  
  private _hideCursor() {
    this._write('\x1B[?25l'); // Hide terminal cursor
  }
  
  private _emojify(msg: string) {
    if (this._config && this._config.emoji) {
      return this._emoji.emojify(msg);
    }
    return msg;
  }
  
  private _log(msg: string, color?: string) {
    msg = this._emojify(msg);
    if (this._chalk['bg' + color]) {
      msg = this._chalk['bg' + color].black(msg); 
    } else {
      msg = this._chalk.bgWhite.black(msg);
    }
    this._write(msg);
  }
}