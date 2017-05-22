import { inject, injectable } from 'inversify';
import { Config, States, SubConfig, Terminal, Write } from '../interfaces';
import { Bindings } from './ioc.bindings';

const fgBlack = '\x1b[30m';

const bgRed = '\x1b[41m';
const bgGreen = '\x1b[42m';
const bgYellow = '\x1b[43m';
const bgWhite = '\x1b[47m';

@injectable()
export class TerminalImpl implements Terminal {
  constructor(
    @inject(Bindings.Config)
    private readonly config: Config,
    @inject(Bindings.Log)
    private readonly writeFunc: Write,
    @inject(Bindings.Error)
    private readonly errorFunc: Write,
  ) { }

  public error(err: string | Error) {
    const msg = err.toString();
    this.errorFunc(`${msg}`);
    if (typeof err !== 'string') {
      this.errorFunc(`${err.stack}`);
    }
  }

  public debug(msg: string) {
    if (this.config.debug && typeof msg === 'string' && msg.length > 0) {
      msg = msg.trim();
      this.writeFunc(msg + '\n');
    }
  }

  public setState(configEntry: SubConfig, state: States, statusMessage?: string) {
    configEntry.state = state;
    configEntry.statusMessage = statusMessage;
    this.render();
  }

  public render() {
    /* istanbul ignore if */
    if (!this || !this.config || this.config.debug) {
      return;
    }
    /* istanbul ignore if */
    if (!this.config.subscriptions) {
      return;
    }

    this._clear();
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
        log(emoji('👍 ') + ' ' + name + ' ', bgGreen);
      } else if (state === 'running') {
        log(emoji('🏃 ') + ' ' + name + ' ', bgYellow);
      } else if (state === 'error') {
        log(emoji('💀 ') + ' ' + name + ' ', bgRed);
      } else {
        log(emoji('⚡️ ') + ' ' + name + ' ', bgWhite);
      }
    }
    log('\n', bgWhite);
    this._reset();
    this.error(statusBuffer.join('\n'));
  }

  private _emoji(str: string) {
    return this.config.emoji ? str : '';
  }

  private _clear() {
    this.writeFunc('\x1b[H\x1b[J');
  }

  private _reset() {
    this.writeFunc('\x1b[0m');
  }

  private _log(msg: string, backgroundColor: string) {
    this.writeFunc(`${backgroundColor}${fgBlack}${msg}`);
    this._reset();
  }
}
