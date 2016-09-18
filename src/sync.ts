import 'reflect-metadata';
import { injectable, inject } from 'inversify';
import { Terminal } from './terminal';
import { SubConfig, Config } from './config';

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
  syncFiles(subConfig: SubConfig, files: SubscriptionResponseFile[]): Promise<void>;
}

export interface Spawn {
  (cmd: string, args: string[]): any;
}

@injectable()
export default class SyncImpl implements Sync {
  private terminal: Terminal;
  private rsyncCmd: string;
  private maxFileLength: number;
  private spawn: Spawn;
  private shell: string;

  constructor(
    @inject('Config') config: Config,
    @inject('Terminal') terminal: Terminal,
    @inject('spawn') spawn: Spawn
  ) {
    this.terminal = terminal;
    this.rsyncCmd = config && config.rsyncCmd || 'rsync';
    this.maxFileLength = config && config.maxFileLength || 100;
    this.spawn = spawn;
    this.shell = '/bin/sh';
  }

  public syncFiles(subConfig: SubConfig, fbFiles?: SubscriptionResponseFile[]): Promise<void> {
    const ignoreFolders = subConfig.ignoreFolders;
    const filesNames: string[] = (fbFiles || []).map(file => file.name);
    const files = filesNames.filter(file => ignoreFolders.findIndex(folder => file.startsWith(folder)) === -1);

    // if there are too many files, it might just be better to let rsync figure out what
    // needs to be synced
    if (files.length > 0 && files.length < this.maxFileLength) {
      return this._syncSpecificFiles(subConfig, files);
    } else {
      return this._syncAllFiles(subConfig);
    }
  }

  private _syncAllFiles(subConfig: SubConfig): Promise<void> {
    const src = subConfig.source;
    const dest = subConfig.destination;
    const ignoreFolders = subConfig.ignoreFolders;
    const excludes = (`--exclude '${ignoreFolders.join(`' --exclude '`)}'`).split(' ');
    const args = [].concat(['-avz', '--delete'], excludes, [src, dest]);

    return this._exec(args);
  }

  private _syncSpecificFiles(subConfig: SubConfig, files: string[]): Promise<void> {
    files =  getUniqueFileFolders(files).concat(files);

    const src = subConfig.source;
    const dest = subConfig.destination;
    const includes = (`--include '${files.join(`' --include '`)}'`).split(' ');
    const args = [].concat(['-avz', '--delete'], includes, ['--exclude', `'*'`, src, dest]);

    return this._exec(args);
  }

  private _exec(args: string[]): Promise<void> {
    const spawn = this.spawn;
    const rsyncCmd = this.rsyncCmd;
    const terminal = this.terminal;
    const shell = this.shell;
    const cmdAndArgs = rsyncCmd + ' ' + args.join(' ');

    return new Promise<void>((resolve, reject) => {

      terminal.debug(cmdAndArgs);
      const child = spawn(shell, ['-c', cmdAndArgs]);
      child.stdout.on('data', (data: string) => terminal.debug(data));
      child.stdout.on('end', resolve);
      child.on('exit', resolve);
      child.on('close', resolve);
    });
  }
}

function getUniqueFileFolders(files: string[]) {
  const folders: string[] = [];
  const length: number = files.length;

  for (let i = 0, folderParts: string[], folderPartsSum: string, file: string; i < length; i++) {
    file = files[i];
    folderParts = file.split('/');
    folderPartsSum = '';
    for (let j = 0; j < folderParts.length - 1; j++) {
      if (folderPartsSum.length > 0) {
        folderPartsSum += '/';
      }
      folderPartsSum += folderParts[j];
      folders.push(folderPartsSum);
    }
  }
  return unique(folders);
}

function unique(arr: string[]): string[] {
  const seen: Map<string, boolean> = new Map();
  return arr.filter((item: string) => {
    return seen.has(item) ? false : !!seen.set(item, true);
  });
}

/*
 *
 *  Polyfills for basic javascript functionality that doesn't exist in 0.12
 *
 */
if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate: (value: string) => boolean) {
    'use strict';
    const list = Object(this);
    const length = list.length;

    let value: any;
    for (let i = 0; i < length; i++) {
      value = list[i];
      if (predicate(value)) {
        return i;
      }
    }
    return -1;
  };
}

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString: string, position?: number){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}
