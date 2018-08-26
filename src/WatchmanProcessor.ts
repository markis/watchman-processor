import { EventEmitter } from 'events';
import { Client, SubscriptionResponse, SubscriptionResponseFile } from 'fb-watchman';
import { inject, injectable } from 'inversify';
import { resolve as resolvePath } from 'path';
import { Config, SubConfig, Sync, WatchmanExpression, WatchmanProcessor } from '../interfaces';
import { Bindings } from './ioc.bindings';

@injectable()
export class WatchmanProcessorImpl implements WatchmanProcessor {
  constructor(
    @inject(Bindings.Config)
    private config: Config,
    @inject(Bindings.WatchmanClient)
    private client: Client,
    @inject(Bindings.Emitter)
    private emitter: EventEmitter,
    @inject(Bindings.Sync)
    private sync: Sync,
  ) { }

  public start(): void {
    const { client, emitter } = this;

    emitter.emit('debug', {msg: 'watchman: initialize'});
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
    const emitter = this.emitter;
    if (error) {
      emitter.emit('error', {err: error });
      return;
    }
    emitter.emit('render');

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

      promises.push(this.subscribe(resolvePath(sub.source), name, expression));
    }
    const render = emitter.emit.bind(emitter, 'render');
    const errHandler = emitter.emit.bind(emitter, 'error');
    Promise.all(promises).then(render).catch(errHandler);

    // subscription is fired regardless of which subscriber fired it
    client.on('subscription', onSubscription);
  }

  private onSubscription(resp: SubscriptionResponse): void {
    const config = this.config;
    const subscription = resp && resp.subscription;
    const files = resp.files;

    const subConfig = config.subscriptions[subscription];
    this.syncFiles(subConfig, files, subscription);
  }

  private syncFiles(subConfig: SubConfig, files: SubscriptionResponseFile[], subscription: string): void {
    const {sync, emitter } = this;
    emitter.emit('setState', {subscription, configEntry: subConfig, state: 'running' });

    const fileNames = (files || []).map(file => file.name);
    sync.syncFiles(subConfig, fileNames)
      .then(() => {
        emitter.emit('setState', {subscription, configEntry: subConfig, state: 'good' });
      })
      .catch(err => {
        emitter.emit('setState', {subscription, configEntry: subConfig, state: 'error', statusMessage: err});
      });
  }

  private subscribe(folder: string, name: string, expression: WatchmanExpression): Promise<void> {
    const emitter = this.emitter;
    const client = this.client;
    const sub = {
      expression,
      fields: ['name', 'exists'],
      relative_root: '',
    };

    emitter.emit('debug', {msg: `subscribe: ${name}` });
    return new Promise<void>((resolve, reject) => {
      client.command(['subscribe', folder, name, sub],
        (error: string) => {
          error ? reject({err: 'failed to start: ' + error, subscription: name}) : resolve();
        });
    });
  }

  private unsubscribe(folder: string, name: string): Promise<string | void> {
    const emitter = this.emitter;
    const client = this.client;

    emitter.emit('debug', {msg: `unsubscribe: ${name}` });
    return new Promise<string | void>(resolve => {
      client.command(['unsubscribe', folder, name], resolve);
    });
  }

  private shutdown(): Promise<string | void> {
    const emitter = this.emitter;
    const client = this.client;

    emitter.emit('debug', {msg: `watchman: shutdown` });
    return new Promise<string | void>(resolve => {
      client.command(['shutdown-server'], resolve);
    });
  }
}
