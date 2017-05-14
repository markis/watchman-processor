import { inject, injectable } from 'inversify';
import { Config, SubConfig, Terminal, Write } from '../interfaces';

@injectable()
export default class TerminalImpl implements Terminal {
  constructor(
    @inject('Config')
    private config: Config,
    @inject('stdOutWrite')
    private writeFunc: Write,
    @inject('stdErrWrite')
    private errorFunc: Write,
    @inject('Chalk')
    private chalk: any,
  ) { }

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
    if (this.config.debug && typeof msg === 'string' && msg.length > 0) {
      msg = msg.trim();
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
    const statusBuffer: string[] = [];
    const log = this._log.bind(this);
    const emoji = this._emoji.bind(this);

    for (const name of subscriptions) {
      const subscription = this.config.subscriptions[name];
      const { state, statusMessage } = subscription;
      if (statusMessage) {
        statusBuffer.push(statusMessage);
      }

      if (state === 'good') {
        log(emoji('👍 ') + ' ' + name + ' ', chalk.bgGreen);
      } else if (state === 'running') {
        log(emoji('⚡️ ') + ' ' + name + ' ', chalk.bgYellow);
      } else if (state === 'error') {
        log(emoji('💀 ') + ' ' + name + ' ', chalk.bgRed);
      } else {
        log(emoji('⚡️ ') + ' ' + name + ' ', chalk.bgWhite);
      }
    }
    log('\n', chalk.bgWhite);
    this.error(statusBuffer.join('\n'));
  }

  private _emoji(str: string) {
    return this.config.emoji ? str : '';
  }

  private _clear() {
    this.writeFunc('\x1b[H\x1b[J');
  }

  private _log(msg: string, chalkColor: any) {
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
