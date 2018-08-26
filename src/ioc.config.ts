import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { Client } from 'fb-watchman';
import { Container } from 'inversify';
import * as interfaces from '../interfaces';
import { CliImpl } from './Cli';
import { ConfigManagerImpl } from './ConfigManager';
import { Bindings } from './ioc.bindings';
import { SyncImpl } from './Sync';
import { TerminalImpl } from './Terminal';
import { WatchmanProcessorImpl } from './WatchmanProcessor';

const container = new Container();

// setup core functionality and externals
container.bind<NodeJS.Process>(Bindings.Process).toConstantValue(process);
container.bind<interfaces.Spawn>(Bindings.Spawn).toConstantValue(spawn);
container.bind<NodeRequire>(Bindings.Require).toConstantValue(require);
container.bind<Client>(Bindings.WatchmanClient).toConstantValue(new Client());
container.bind<EventEmitter>(Bindings.Emitter).toConstantValue(new EventEmitter());

// setup the main classes
container.bind<interfaces.Cli>(Bindings.Cli).to(CliImpl);
container.bind<interfaces.ConfigManager>(Bindings.ConfigManager).to(ConfigManagerImpl);
container.bind<interfaces.Config>(Bindings.Config).toDynamicValue(() => {
  return container.get<interfaces.ConfigManager>(Bindings.ConfigManager).getConfig() as any;
});
container.bind<interfaces.Terminal>(Bindings.Terminal).to(TerminalImpl);
container.bind<interfaces.Sync>(Bindings.Sync).to(SyncImpl);
container.bind<interfaces.WatchmanProcessor>(Bindings.WatchmanProcessor).to(WatchmanProcessorImpl);

export { container };
