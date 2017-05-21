import * as proc from 'child_process';
import { Client } from 'fb-watchman';
import { Container } from 'inversify';
import * as interfaces from '../interfaces';
import { ConfigManagerImpl } from './ConfigManager';
import { Bindings } from './ioc.bindings';
import { SyncImpl } from './Sync';
import { TerminalImpl } from './Terminal';
import { Utils } from './Utils';
import { WatchmanProcessorImpl } from './WatchmanProcessor';

const container = new Container();
const configManager = new ConfigManagerImpl({}, require, Utils.log);
const config: interfaces.Config | Error = configManager.getConfig();

// setup core functionality and externals
container.bind<interfaces.Spawn>(Bindings.Spawn).toConstantValue(proc.spawn);
container.bind<NodeRequire>(Bindings.Require).toConstantValue(require);
container.bind<Client>(Bindings.WatchmanClient).toConstantValue(new Client());
container.bind<interfaces.Write>(Bindings.Error).toConstantValue(Utils.error);
container.bind<interfaces.Write>(Bindings.Log).toConstantValue(Utils.log);

// setup the main classes
container.bind<interfaces.ConfigManager>(Bindings.ConfigManager).toConstantValue(configManager);
container.bind<interfaces.Config>(Bindings.Config).toConstantValue(config as any);
container.bind<interfaces.Terminal>(Bindings.Terminal).to(TerminalImpl);
container.bind<interfaces.Sync>(Bindings.Sync).to(SyncImpl);
container.bind<interfaces.WatchmanProcessor>(Bindings.WatchmanProcessor).to(WatchmanProcessorImpl);

// wire up the dependencies and return
const watchmanProcessor = container.get<interfaces.WatchmanProcessor>(Bindings.WatchmanProcessor);

export { config, configManager, watchmanProcessor };
