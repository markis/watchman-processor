import { Client, SubscriptionResponse, SubscriptionResponseFile } from 'fb-watchman';
import { inject, injectable } from 'inversify';
import { Config, SubConfig, Sync, Terminal, WatchmanExpression, WatchmanProcessor } from '../interfaces';
import { Bindings } from './ioc.bindings';

@injectable()
export class WatchmanProcessorImpl implements WatchmanProcessor {
  constructor(
    @inject(Bindings.Config)
    private config: Config,
    @inject(Bindings.WatchmanClient)
    private client: Client,
    @inject(Bindings.Terminal)
    private terminal: Terminal,
    @inject(Bindings.Sync)
    private sync: Sync,
  ) { }

  public start(): void {
    const { client, terminal } = this;

    terminal.debug('watchman: initialize');
    const onCapabilityCheck = this.onCapabilityCheck.bind(this);
    client.capabilityCheck({}, onCapabilityCheck);
  }

  public end(): Promise<void> {
    const { client, config, sync } = this;
    const subscriptions = config.subscriptions;
    const promises: Array<Promise<string | void>> = [];

    for (const name of Object.keys(subscriptions)) {
      const sub = subscriptions[name];
      promises.push(this.unsubscribe(sub.source, name));
    }
    sync.end();
    return Promise.all(promises)
      .then(() => {
        if (config.controlWatchman) {
          this.shutdown();
        } else {
          client.end();
        }
      });
  }

  private onCapabilityCheck(error?: string | Error): void {
    const terminal = this.terminal;
    if (error) {
      terminal.error(error);
      return;
    }
    terminal.render();

    const client = this.client;
    const onSubscription = this.onSubscription.bind(this);
    const promises: Array<Promise<string | void>> = [];
    const subscriptions = Object.keys(this.config.subscriptions);

    for (const name of subscriptions) {
      const sub = this.config.subscriptions[name];
      const expression = sub.watchExpression || ['allof', ['type', 'f']];

      for (const folder of sub.ignoreFolders) {
        expression.push(['not', ['dirname', folder]]);
      }

      promises.push(this.subscribe(sub.source, name, expression));
    }
    const render = terminal.render.bind(terminal);
    const errHandler = terminal.error.bind(terminal);
    Promise.all(promises).then(render).catch(errHandler);

    // subscription is fired regardless of which subscriber fired it
    client.on('subscription', onSubscription);
  }

  private onSubscription(resp: SubscriptionResponse): void {
    const config = this.config;
    const subscription = resp && resp.subscription;
    const files = resp.files;

    const subConfig = config.subscriptions[subscription];
    this.syncFiles(subConfig, files);
  }

  private syncFiles(subConfig: SubConfig, files: SubscriptionResponseFile[]): void {
    const {sync, terminal } = this;
    terminal.setState(subConfig, 'running');

    const fileNames = (files || []).map(file => file.name);
    sync.syncFiles(subConfig, fileNames)
      .then(() => {
        terminal.setState(subConfig, 'good');
      })
      .catch(err => {
        terminal.setState(subConfig, 'error', err);
      });
  }

  private subscribe(folder: string, name: string, expression: WatchmanExpression): Promise<void> {
    const terminal = this.terminal;
    const client = this.client;
    const sub = {
      expression,
      fields: ['name', 'exists'],
      relative_root: '',
    };

    terminal.debug(`subscribe: ${name}`);
    return new Promise<void>((resolve, reject) => {
      client.command(['subscribe', folder, name, sub],
        (error: string) => {
          error ? reject('failed to start: ' + error) : resolve();
        });
    });
  }

  private unsubscribe(folder: string, name: string): Promise<string | void> {
    const terminal = this.terminal;
    const client = this.client;

    terminal.debug(`unsubscribe: ${name}`);
    return new Promise<string | void>(resolve => {
      client.command(['unsubscribe', folder, name], resolve);
    });
  }

  private shutdown(): Promise<string | void> {
    const terminal = this.terminal;
    const client = this.client;

    terminal.debug(`watchman: shutdown`);
    return new Promise<string | void>(resolve => {
      client.command(['shutdown-server'], resolve);
    });
  }
}
