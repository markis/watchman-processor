import { SubConfig } from './SubConfig';

export interface Sync {
  /**
   * Sync files between the source and destination
   *  if no files are specified then attempt to sync everything
   *  otherwise sync the specific list of files sent from watchman
   *
   * @param {SubConfig} subConfig
   * @param {SubscriptionResponseFile[]} files
   * @returns {Promise<void>}
   *
   * @memberOf Sync
   */
  syncFiles(subConfig: SubConfig, files: string[]): Promise<void>;
}
