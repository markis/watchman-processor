import 'reflect-metadata';
import 'ts-helpers';
import { injectable, inject } from 'inversify';
import { Config, SubConfig } from '../lib/config';

export interface Terminal {
  start(): void;
  error(err: string | Error): void;
  debug(msg: string): void;
  setState(configEntry: SubConfig, state: string, statusMessage?: string): void;
  render(): void;
}

@injectable()
export default class TerminalImpl implements Terminal {
  private _config: Config;
  private _error: (msg: string | Error) => void;
  private _write: (msg: string) => void;
  private _chalk: Chalk;
  private _emoji: Emoji;
  
  constructor(
    @inject('Config') config: Config,
    @inject('stdOutWrite') stdOutWrite: (msg: string) => void,
    @inject('stdErrWrite') stdErrWrite: (msg: string) => void,
    @inject('Chalk') chalk: Chalk,
    @inject('Emoji') emoji: Emoji
  ) {
    this._config = config || {} as Config;
    this._error = stdErrWrite;
    this._write = stdOutWrite;
    this._chalk = chalk;
    this._emoji = emoji;
  }
  
  public error(err: string | Error) {
    const msg = err.toString();
    this._error(this._chalk.red(msg));
  }
  
  public start() {
    this.debug('starting');
    if (!this._config.debug) {
      this._enableFullScreen();
      this._hideCursor();
    }
  }
  
  public debug(msg: string) {
    if (this._config.debug && msg) {
      this._write(this._chalk.white(msg + '\n'));
    }
  }
  
  public setState(configEntry: SubConfig, state: string, statusMessage?: string) {
    configEntry.state = state;
    configEntry.statusMessage = statusMessage;
    this.render();
  }
  
  public render() {
    if (this._config.debug) {
      return;
    }
    this._clear();
    const chalk = this._chalk,
      subscriptions = Object.keys(this._config.subscriptions);
    
    for (let i = 0; i < subscriptions.length; i++) {
      const name = subscriptions[i],
        subscription = this._config.subscriptions[name],
        state = subscription.state;
      
      if (state === 'good') {
        this._log(':thumbsup:  ' + name + ' ', chalk.bgGreen);
      } else if (state === 'running') {
        this._log(':running:  ' + name + ' ', chalk.bgYellow);
      } else if (state === 'error') {
        this._log(':skull_and_crossbones:  ' + name + ' ', chalk.bgRed);
      } else {
        this._log(':hourglass:  ' + name + ' ', chalk.bgWhite);
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
  
  private _log(msg: string, chalkColor: ChalkColors = this._chalk.bgWhite) {
    msg = this._emojify(msg);
    msg = chalkColor.black(msg);
    this._write(msg);
  }
}
