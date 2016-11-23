import 'reflect-metadata';

import * as fs from 'fs';
import { injectable } from 'inversify';

import { Write } from './terminal';

export interface ConfigManager {
  /**
   * Retrieve the Config data, it is dependent on the config file existing
   *
   * @returns {Config}
   * @memberOf ConfigManager
   */
  getConfig(): Config;

  /**
   * This will create config file in the default location with the example data
   *
   * @memberOf ConfigManager
   */
  createConfig(): void;
}

export interface Config {
  /**
   * changes the output to show debug information, cmd and stdout output
   *
   * @type {boolean}
   * @memberOf Config
   */
  debug?: boolean;

  /**
   * if your terminal window can support emojis
   *
   * @type {boolean}
   * @memberOf Config
   */
  emoji?: boolean;

  /**
   * this limits the number files to pass to rsync.
   *
   * @type {number}
   * @memberOf Config
   */
  maxFileLength?: number;

  /**
   *  default: 'rsync' -- override to whatever rsync command is installed or located
   *
   * @type {string}
   * @memberOf Config
   */
  rsyncCmd?: string;

  /**
   * These are specified subscriptions, they are listed by name
   *
   * @type {*}
   * @memberOf Config
   */
  subscriptions?: Map<string, SubConfig> | any;
}

export interface SubConfig {
  /**
   * This specifies the type of process that should be performed.
   *
   * @type {'rsync'}
   * @memberOf SubConfig
   */
  type: 'rsync';
  /**
   * Source of the files, also the watch folder
   *
   * @type {string}
   * @memberOf SubConfig
   */
  source: string;
  /**
   * Destination of where the files should go
   *
   * @type {string}
   * @memberOf SubConfig
   */
  destination: string;
  /**
   * These are folders to ignore relative to the source.
   *
   * @type {string}
   * @memberOf SubConfig
   */
  ignoreFolders: string[];
  /**
   * This will be combined with ignore folders, but this can allow for more granular
   * watch expressions with fb-watchman @see https://facebook.github.io/watchman/
   *
   * @type {WatchmanExpression}
   * @memberOf SubConfig
   */
  watchExpression?: WatchmanExpression;
  /**
   * This reflects the current state of synchronization
   *
   * @type {string}
   * @memberOf SubConfig
   */
  state?: string;
  /**
   * Error messages get relected here.  Should mostly get left empty.
   *
   * @type {string}
   * @memberOf SubConfig
   */
  statusMessage?: string;
}

export interface ConfigManagerOptions {
  /**
   * Location of the user's config file
   *
   * @type {string}
   * @memberOf ConfigManagerOptions
   */
  confFile?: string;
  /**
   * Location of the example file within the project
   *
   * @type {string}
   * @memberOf ConfigManagerOptions
   */
  exampleConfFile?: string;
}

export type WatchmanExpression = Array<Array<(string | string[] | (string | string[]))>>;

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
    const EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';

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
      for (let name of subscriptions) {
        let subscription = config.subscriptions[name];
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
      const reader = fs.createReadStream(exampleConfFile);
      const writer = fs.createWriteStream(confFile);

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
