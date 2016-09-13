import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Sync } from './sync';
import { Terminal } from './terminal';
import { Config, SubConfig } from './config';

export interface Watchman {
  start(): void;
}

@injectable()
export default class WatchmanImpl implements Watchman {
  private _config: Config;
  private _client: WatchmanClient;
  private _terminal: Terminal;
  private _sync: Sync;
  
  constructor(
    @inject('Config') config: Config, 
    @inject('WatchmanClient') watchmanClient: WatchmanClient,
    @inject('Terminal') terminal: Terminal, 
    @inject('Sync') sync: Sync
  ) {
    this._config = config;
    this._client = watchmanClient;
    this._terminal = terminal;
    this._sync = sync;
  }
  
  public start(): void {
    const capabilities = {
      optional: [] as string[],
      required: ['relative_root'] as string[]
    };
    const onCapabilityCheck = this._onCapabilityCheck.bind(this);
    
    this._terminal.start();
    this._client.capabilityCheck(capabilities, onCapabilityCheck);
  }
  
  private _onCapabilityCheck(error: string | Error): void {
    const terminal = this._terminal;
    if (error) {
      terminal.error(error);
      return;
    }
    terminal.render();

    const client = this._client;
    const onSubscription = this._onSubscription.bind(this);
    const promises: Promise<string | void>[] = [], subscriptions = Object.keys(this._config.subscriptions);
    for (let i = 0; i < subscriptions.length; i++) {
      const name = subscriptions[i],
        subscription: SubConfig = this._config.subscriptions[name],
        ignoreFolders = subscription.ignoreFolders,
        watchExpression = subscription.watchExpression || ['allof', ['type', 'f']];

      for (let j = 0; j < ignoreFolders.length; j++) {
        watchExpression.push(['not', ['dirname', ignoreFolders[j]]]);
      }

      promises.push(this._subscribe(subscription.source, name, watchExpression));
    }
    Promise.all(promises).then(this._terminal.render);

    // subscription is fired regardless of which subscriber fired it
    client.on('subscription', onSubscription);
  }

  private _syncFiles(subConfig: any, files: SubscriptionResponseFile[] = null) {
    const terminal = this._terminal;
    terminal.setState(subConfig, 'running');
    this._sync.syncFiles(subConfig, files)
      .then(() => {
        terminal.setState(subConfig, 'good');
      })
      .catch(() => {
        terminal.setState(subConfig, 'error');
      });
  }
  
  private _onSubscription(resp: SubscriptionResponse): void {
    const config = this._config;
    const subscription = resp && resp.subscription;
    const files = resp.files;

    const subConfig = config.subscriptions[subscription];
    this._syncFiles(subConfig, files);
  }
  
  private _subscribe(folder: string, name: string, expression: (string | string[] | (string | string[])[])[]): Promise<string | void> {
    const terminal = this._terminal,
      client = this._client;
    
    const sub = {
      expression: expression,
      fields: ['name', 'exists'],
      relative_root: ''
    };

    terminal.debug(`starting: ${name} expression: ${JSON.stringify(expression)}`);
    return new Promise<string | void>(function (resolve, reject) {
      client.command(['subscribe', folder, name, sub],
        (error: string) => {
          if (error) {
            reject('failed to subscribe: ' + error);
          }
          resolve();
        });
    });
  }
}

