import 'reflect-metadata';

import { Cli, ConfigManager, Terminal, WatchmanProcessor } from '../interfaces';
import { Bindings } from './ioc.bindings';
import { container } from './ioc.config';
import { WatchmanProcessorEvent } from './WatchmanProcessorEvent';

const cli = container.get<Cli>(Bindings.Cli);
const configManager = container.get<ConfigManager>(Bindings.ConfigManager);
const watchmanProcessor = container.get<WatchmanProcessor>(Bindings.WatchmanProcessor);
const terminal = container.get<Terminal>(Bindings.Terminal);

const args = cli.getArguments();
let processor = watchmanProcessor;

if (args.init) {
  configManager.createConfig();
} else {
  const config = configManager.getConfig();
  if (config instanceof Error) {
    processor = null as any;
    process.stderr.write(config.message + '\n');
    if (config.name !== 'init') {
      process.stderr.write(config.name);
      if (config.stack) {
        process.stderr.write(config.stack);
      }
    }
  }
}

export default {
  WatchmanProcessorEvent,
  config: configManager.getConfig(),
  processor,
  terminal,
};
