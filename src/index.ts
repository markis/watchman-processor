import 'reflect-metadata';

import { configManager, watchmanProcessor } from './ioc.config';
import { Utils } from './Utils';

let processor = watchmanProcessor;

if (process.argv[2] === 'init') {
  configManager.createConfig();
} else {
  const config = configManager.getConfig();
  if (config instanceof Error) {
    processor = null as any;
    Utils.error(config.message + '\n');
    if (config.name !== 'init') {
      Utils.error(config.name);
      if (config.stack) {
        Utils.error(config.stack);
      }
    }
  }
}

export default processor;
