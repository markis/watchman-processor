import 'reflect-metadata';

import { inject, injectable } from 'inversify';

import { Config, SubConfig } from './config';

export interface Terminal {
  /**
   * This let's the terminal know that the application is starting.  So do any setup necessary.
   *
   * @memberOf Terminal
   */
  start(): void;
  /**
   * Display the user an error message
   *
   * @param {(string | Error)} err
   *
   * @memberOf Terminal
   */
  error(err: string | Error): void;
  /**
   * Display debug information to the user.  Is automatically ignored if the config.debug switch is set to false.
   *
   * @param {string} msg
   *
   * @memberOf Terminal
   */
  debug(msg: string): void;
  /**
   * Set the state of the subscription and any potential extra information in statusMessage
   *
   * @param {SubConfig} configEntry
   * @param {string} state
   * @param {string} [statusMessage]
   *
   * @memberOf Terminal
   */
  setState(configEntry: SubConfig, state: string, statusMessage?: string): void;
  /**
   * Render the current state of all the subscriptions
   *
   * @memberOf Terminal
   */
  render(): void;
}

export interface Write {
  (str: string): void;
}

@injectable()
export default class TerminalImpl implements Terminal {
  private config: Config;
  private errorFunc: Write;
  private writeFunc: Write;
  private chalk: any;
  private emoji: Emoji;

  constructor(
    @inject('Config') config: Config,
    @inject('stdOutWrite') stdOutWrite: (msg: string) => void,
    @inject('stdErrWrite') stdErrWrite: (msg: string) => void,
    @inject('Chalk') chalk: any,
    @inject('Emoji') emoji: Emoji,
  ) {
    this.config = config as Config;
    this.errorFunc = stdErrWrite;
    this.writeFunc = stdOutWrite;
    this.chalk = chalk;
    this.emoji = emoji;
  }

  public error(err: string | Error) {
    const msg = err.toString();
    this.errorFunc(this.chalk.red(msg));
    if (typeof err !== 'string') {
      this.errorFunc(this.chalk.red(err.stack));
    }
  }

  public start() {
    this.debug('starting');
  }

  public debug(msg: string) {
    if (this.config.debug && msg) {
      this.writeFunc(msg + '\n');
    }
  }

  public setState(configEntry: SubConfig, state: string, statusMessage?: string) {
    configEntry.state = state;
    configEntry.statusMessage = statusMessage;
    this.render();
  }

  public render() {
    if (!this || !this.config || this.config.debug) {
      return;
    }
    this._clear();
    const chalk = this.chalk;
    const subscriptions = Object.keys(this.config.subscriptions);

    for (let name of subscriptions) {
      let subscription = this.config.subscriptions[name];
      let state = subscription.state;

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
    this._log('\n', chalk.bgWhite);
  }

  private _clear() {
    this.writeFunc('\x1b[H\x1b[J');
  }

  private _emojify(msg: string) {
    if (this.config && this.config.emoji) {
      return this.emoji.emojify(msg);
    }
    return msg;
  }

  private _log(msg: string, chalkColor: any) {
    msg = this._emojify(msg);
    msg = chalkColor.black(msg);
    this.writeFunc(msg);
  }
}

/**
 * Wraps process.stderr.write, so that we can mock this method in tests
 *
 * @param {string} msg
 */
export function StdErrWriteImpl(msg: string) {
  process.stderr.write(msg);
}

/**
 * Wraps process.stdout.write, so that we mock this method in tests
 *
 * @param {string} msg
 */
export function StdOutWriteImpl(msg: string) {
  process.stdout.write(msg);
}
