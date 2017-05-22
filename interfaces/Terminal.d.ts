import { SubConfig } from './SubConfig';

export interface Terminal {
  /**
   * Display the user an error message
   *
   * @param {(string | Error)} err
   *
   * @memberOf Terminal
   */
  error(err: string | Error): void;
  /**
   * Display debug information to the user.  Is automatically ignored if the config.debug switch is set to false.
   *
   * @param {string} msg
   *
   * @memberOf Terminal
   */
  debug(msg: string): void;
  /**
   * Set the state of the subscription and any potential extra information in statusMessage
   *
   * @param {SubConfig} configEntry
   * @param {string} state
   * @param {string} [statusMessage]
   *
   * @memberOf Terminal
   */
  setState(configEntry: SubConfig, state: string, statusMessage?: string): void;
  /**
   * Render the current state of all the subscriptions
   *
   * @memberOf Terminal
   */
  render(): void;
}
