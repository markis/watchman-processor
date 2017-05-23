import { Config } from './Config';

export interface ConfigManager {
  /**
   * Retrieve the Config data, it is dependent on the config file existing
   *
   * @returns {Config}
   * @memberOf ConfigManager
   */
  getConfig(): Config | Error;

  /**
   * This will create config file in the default location with the example data
   *
   * @memberOf ConfigManager
   */
  createConfig(exampleConfFile?: string): Promise<void>;
}
