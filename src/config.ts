import { createReadStream, createWriteStream } from 'fs';
import { injectable } from 'inversify';
import { Config, ConfigManager, ConfigManagerOptions, Write } from '../interfaces';

@injectable()
export default class ConfigManagerImpl implements ConfigManager {
  private confFile: string;
  private exampleConfFile: string;
  private require: NodeRequireFunction;
  private write: Write;
  private cachedConfig: Config;

  constructor(
    options: ConfigManagerOptions = {},
    customRequire: NodeRequireFunction = null,
    write: Write = noop,
  ) {
    const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
    const EXAMPLE_CONF_FILE = __dirname + '/example/watchman-processor.config.js';

    this.require = customRequire || require;
    this.confFile = options.confFile || CONF_FILE;
    this.exampleConfFile = options.exampleConfFile || EXAMPLE_CONF_FILE;
    this.write = write;
  }

  public getConfig(): Config {
    try {
      if (this.cachedConfig) {
        return this.cachedConfig;
      }
      const config = this.cachedConfig = this.require(this.confFile) as Config;
      const subscriptions = Object.keys(config.subscriptions);

      // ensure ignoreFolders has a value
      for (const name of subscriptions) {
        const subscription = config.subscriptions[name];
        subscription.ignoreFolders = subscription.ignoreFolders || [];
      }
      return config;
    } catch (e) {
      return null;
    }
  }

  public createConfig(): Promise<string> {
    const self = this;
    const confFile = this.confFile;
    const exampleConfFile = this.exampleConfFile;

    return new Promise<string>((resolve, reject) => {
      const reader = createReadStream(exampleConfFile);
      const writer = createWriteStream(confFile);

      reader.on('error', reject);
      writer.on('error', reject);
      writer.on('close', () => {
        self.write('Done.  "' + confFile + '" created.\n');
        resolve();
      });
      reader.pipe(writer);
    });

  }
}

function noop() {
  // do nothing
}
