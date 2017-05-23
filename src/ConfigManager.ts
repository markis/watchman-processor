import { createReadStream, createWriteStream, existsSync } from 'fs';
import { inject, injectable } from 'inversify';
import { resolve } from 'path';
import { Cli, Config, ConfigManager, ConfigManagerOptions } from '../interfaces';
import { Bindings } from './ioc.bindings';

const INIT_MSG = 'The watchman-processor configuration does not exist. \n\n' +
                 'Run "watchman-processor --init" to create an example configuration file.\n';

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
    @inject(Bindings.Cli)
    private readonly cli: Cli,
    @inject(Bindings.Require)
    private readonly require: NodeRequire,
    @inject(Bindings.Process)
    private readonly process: NodeJS.Process,
  ) {
    /* istanbul ignore next */
    const homeFolder = this.process.env[(this.process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    const args = this.cli.getArguments();

    this.options = Object.assign({
      confFile: args.config || resolve(homeFolder + '/.watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname + '/example/watchman-processor.config.js'),
    });
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

      /* istanbul ignore if */
      if (!config.subscriptions) {
        throw new Error('No subscriptions defined');
      }

      // set the default settings for subscription configs
      const subscriptions = Object.keys(config.subscriptions);
      for (const name of subscriptions) {
        config.subscriptions[name] = Object.assign({}, DEFAULT_SUBSCRIPTION, config.subscriptions[name]);
      }
      return config;
    } catch (e) {
      return e;
    }
  }

  public createConfig(
    /* istanbul ignore else */
    confFile: string = this.options.confFile,
    /* istanbul ignore else */
    exampleConfFile: string = this.options.exampleConfFile,
  ): Promise<void> {
    const { options, process } = this;

    return new Promise<void>((resolve, reject) => {
      const reader = createReadStream(exampleConfFile);
      const writer = createWriteStream(confFile);

      reader.on('error', reject);
      writer.on('error', reject);
      writer.on('close', () => {
        process.stdout.write('Done.  "' + options.confFile + '" created.\n');
        resolve();
      });
      reader.pipe(writer);
    });
  }
}
