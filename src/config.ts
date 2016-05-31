import 'reflect-metadata';
import { injectable } from 'inversify';
import * as fs from 'fs';

const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
const EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';

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
  watchExpression?: (string | string[])[];
  state?: string;
  statusMessage?: string;
}

@injectable()
export default class ConfigManagerImpl implements ConfigManager {
  public getConfig(): Config {
    try {
      return require(CONF_FILE) as Config;
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.error('"' + HOME_FOLDER + '/.watchman-processor.config.js" does not exist. \n\n' +
          'Run "watchman-processor init" to create an example configuration file.');
        return null as Config;
      } else {
        throw e;
      }
    }
  }

  public createConfig(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = fs.createReadStream(EXAMPLE_CONF_FILE);
      reader.on('error', function (err: Error) {
        console.error(err);
        reject(err);
      });
      const writer = fs.createWriteStream(CONF_FILE);
      writer.on('error', function (err: Error) {
        console.error(err);
        reject(err);
      });
      writer.on('close', function () {
        console.log('Done.  "' + CONF_FILE + '" created.');
        resolve('Done.  "' + CONF_FILE + '" created.');
      });
      reader.pipe(writer);
    });

  }
}
