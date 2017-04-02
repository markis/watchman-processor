import { WatchmanExpression } from './WatchmanExpression';

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
