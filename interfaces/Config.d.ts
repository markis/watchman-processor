import { SubConfig } from './SubConfig';

export interface Config {
  /**
   * changes the output to show debug information, cmd and stdout output
   *
   * @type {boolean}
   * @memberOf Config
   */
  debug: boolean;

  /**
   * delete extraneous files from destination
   *
   * @type {boolean}
   * @memberOf Config
   */
  delete: boolean;

  /**
   * if your terminal window can support emojis
   *
   * @type {boolean}
   * @memberOf Config
   */
  emoji: boolean;

  /**
   * if you want watchman to completely control the watchman process
   *  - if true, this will shutdown and start the watchman process
   *
   * @type {boolean}
   * @memberOf Config
   */
  controlWatchman: boolean;

  /**
   * this limits the number files to pass to rsync.
   *
   * @type {number}
   * @memberOf Config
   */
  maxFileLength: number;

  /**
   *  default: 'rsync' -- override to whatever rsync command is installed or located
   *
   * @type {string}
   * @memberOf Config
   */
  rsyncCmd: string;

  /**
   *  default: '/bin/sh' -- shell for executing rsync
   *
   * @type {string}
   * @memberOf Config
   */
  shell: string;

  /**
   * These are specified subscriptions, they are listed by name
   *
   * @type {*}
   * @memberOf Config
   */
  subscriptions: {
    [index: string]: SubConfig;
  };
}
