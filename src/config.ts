import 'reflect-metadata';
import { injectable } from 'inversify';
import * as fs from 'fs';

export interface ConfigManager {
  getConfig(): Config;
  createConfig(): void;
}

export interface Config {
  // changes the output to show debug information, cmd and stdout output
  debug?: boolean;
  
  // if your terminal window can support emojis  
  emoji?: boolean;

  // this limits the number files to pass to rsync.
  maxFileLength?: number;
  
  // default: 'rsync' -- override to whatever rsync command is installed or located
  rsyncCmd?: string;
  subscriptions?: any;
}

export interface SubConfig {
  type: 'rsync';
  source: string;
  destination: string;
  ignoreFolders: string[];
  watchExpression?: (string | string[] | (string | string[])[])[];
  state?: string;
  statusMessage?: string;
}

export interface ConfigManagerOptions {
  confFile?: string;
  exampleConfFile?: string;
}

@injectable()
export default class ConfigManagerImpl implements ConfigManager {
  private _confFile: string;
  private _exampleConfFile: string;
  constructor(
    options: ConfigManagerOptions = {}
  ) {
    const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
    const EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';
   
    this._confFile = options.confFile || CONF_FILE;
    this._exampleConfFile = options.exampleConfFile || EXAMPLE_CONF_FILE;
  }
  
  public getConfig(): Config {
    try {
      const config = require(this._confFile) as Config,
        subscriptions = Object.keys(config.subscriptions);

      // ensure ignoreFolders has a value
      for (let i = 0; i < subscriptions.length; i++) {
        const name = subscriptions[i],
          subscription: SubConfig = config.subscriptions[name];
        
        subscription.ignoreFolders = subscription.ignoreFolders || [];
      }
      return config;
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.error('"' + this._confFile + '" does not exist. \n\n' +
          'Run "watchman-processor init" to create an example configuration file.');
        return null as Config;
      } else {
        throw e;
      }
    }
  }

  public createConfig(): Promise<string> {
    const confFile = this._confFile,
      exampleConfFile = this._exampleConfFile;
    
    return new Promise<string>((resolve, reject) => {
      const reader = fs.createReadStream(exampleConfFile);
      reader.on('error', reject);
      const writer = fs.createWriteStream(confFile);
      writer.on('error', reject);
      writer.on('close', function () {
        console.log('Done.  "' + confFile + '" created.');
        resolve();
      });
      reader.pipe(writer);
    });

  }
}
