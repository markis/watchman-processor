import { createReadStream, createWriteStream, existsSync } from 'fs';
import { injectable } from 'inversify';
import { resolve } from 'path';
import { Config, ConfigManager, ConfigManagerOptions, Write } from '../interfaces';

const BUILTIN_REQURE = require;
const INIT_MSG = 'The watchman-processor configuration does not exist. \n\n' +
                 'Run "watchman-processor init" to create an example configuration file.\n';

const DEFAULT_CONFIG = {
  controlWatchman: true,
  debug: false,
  emoji: true,
  maxFileLength: 100,
  rsyncCmd: 'rsync',
  shell: '/bin/sh',
};

const DEFAULT_SUBSCRIPTION = {
  ignoreFolders: [] as string[],
  type: 'rsync',
};

interface ConfigManagerOptionsInternal extends ConfigManagerOptions {
  confFile: string;
  exampleConfFile: string;
}

@injectable()
export class ConfigManagerImpl implements ConfigManager {
  private cachedConfig: Config;
  private options: ConfigManagerOptionsInternal;

  constructor(
    options: ConfigManagerOptions = {},
    private readonly require: NodeRequire = BUILTIN_REQURE,
    private readonly write: Write = noop,
  ) {
    const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    this.options = Object.assign({
      confFile: resolve(HOME_FOLDER + '/.watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname + '/example/watchman-processor.config.js'),
    }, options);
  }

  public getConfig(): Config | Error {
    const { cachedConfig, options, require } = this;
    if (cachedConfig) {
      return cachedConfig;
    }
    try {
      const configFile = resolve(options.confFile);
      if (!existsSync(configFile)) {
        const error = new Error(INIT_MSG);
        error.name = 'init';
        throw error;
      }
      const userConfig = require(configFile) as Config;
      const config: Config = this.cachedConfig = Object.assign({}, DEFAULT_CONFIG, userConfig);
      const subscriptions = Object.keys(config.subscriptions);

      /* istanbul ignore if */
      if (!config.subscriptions) {
        throw new Error('No subscriptions defined');
      }

      // ensure ignoreFolders has a value
      for (const name of subscriptions) {
        config.subscriptions[name] = Object.assign({}, DEFAULT_SUBSCRIPTION, config.subscriptions[name]);
      }
      return config;
    } catch (e) {
      return e;
    }
  }

  public createConfig(): Promise<void> {
    const { options, write } = this;

    return new Promise<void>((resolve, reject) => {
      const reader = createReadStream(options.exampleConfFile);
      const writer = createWriteStream(options.confFile);

      reader.on('error', reject);
      writer.on('error', reject);
      writer.on('close', () => {
        write('Done.  "' + options.confFile + '" created.\n');
        resolve();
      });
      reader.pipe(writer);
    });
  }
}

function noop() {
  // do nothing
}
