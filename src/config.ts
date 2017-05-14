import { createReadStream, createWriteStream, existsSync } from 'fs';
import { injectable } from 'inversify';
import { resolve } from 'path';
import { Config, ConfigManager, ConfigManagerOptions, Write } from '../interfaces';

const BUILTIN_REQURE = require;
const INIT_MSG = 'The watchman-processor configuration does not exist. \n\n' +
                 'Run "watchman-processor init" to create an example configuration file.\n';

@injectable()
export default class ConfigManagerImpl implements ConfigManager {
  private confFile: string;
  private exampleConfFile: string;
  private cachedConfig: Config;

  constructor(
    options: ConfigManagerOptions = {},
    private require: NodeRequire = BUILTIN_REQURE,
    private write: Write = noop,
  ) {
    const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
    const EXAMPLE_CONF_FILE = __dirname + '/example/watchman-processor.config.js';

    this.confFile = options && options.confFile || CONF_FILE;
    this.exampleConfFile = options && options.exampleConfFile || EXAMPLE_CONF_FILE;
  }

  public getConfig(): Config | Error {
    const { cachedConfig, confFile, require } = this;
    try {
      if (cachedConfig) {
        return cachedConfig;
      }
      const configFile = resolve(confFile);
      if (!existsSync(configFile)) {
        const error = new Error(INIT_MSG);
        error.name = 'init';
        throw error;
      }

      const config = this.cachedConfig = require(configFile) as Config;
      const subscriptions = Object.keys(config.subscriptions);

      // ensure ignoreFolders has a value
      for (const name of subscriptions) {
        const subscription = config.subscriptions[name];
        subscription.ignoreFolders = subscription.ignoreFolders || [];
      }
      return config;
    } catch (e) {
      return e;
    }
  }

  public createConfig(): Promise<string> {
    const { confFile, exampleConfFile, write } = this;

    return new Promise<string>((resolve, reject) => {
      const reader = createReadStream(exampleConfFile);
      const writer = createWriteStream(confFile);

      reader.on('error', reject);
      writer.on('error', reject);
      writer.on('close', () => {
        write('Done.  "' + confFile + '" created.\n');
        resolve();
      });
      reader.pipe(writer);
    });

  }
}

function noop() {
  // do nothing
}
