import { Config } from '../lib/config';
import * as fs from 'fs';

const HOME_FOLDER = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
const EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';

export interface ConfigManager {
  getConfig(): Config
  createConfig(): void;
}

export default class ConfigManagerImpl implements ConfigManager {
  getConfig(): Config {
    try {
      return require(CONF_FILE) as Config;
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.error('"' + HOME_FOLDER + '/.watchman-processor.config.js" does not exist. \n\n' +
          'Run "watchman-processor init" to create an example configuration file.');
        return null;
      } else {
        throw e;
      }
    }
  }

  createConfig(): Promise<string> {
    return new Promise((resolve, reject) => {
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