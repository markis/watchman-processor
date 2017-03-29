import 'reflect-metadata';

import * as proc from 'child_process';
import { inject, injectable } from 'inversify';

import { Config, SubConfig } from './config';
import { Terminal } from './terminal';

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

export interface Spawn {
  (cmd: string, args: string[]): proc.ChildProcess;
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
    @inject('spawn') spawn: Spawn,
  ) {
    this.terminal = terminal;
    this.rsyncCmd = config && config.rsyncCmd || 'rsync';
    this.maxFileLength = config && config.maxFileLength || 100;
    this.spawn = spawn;
    this.shell = '/bin/sh';
  }

  public syncFiles(subConfig: SubConfig, filesNames?: string[]): Promise<void> {
    const ignoreFolders = subConfig.ignoreFolders;

    // remove files that are in the ignore folders
    const files = (filesNames || []).filter(file => !exists(ignoreFolders, file));

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
    files = getUniqueFileFolders(files).concat(files);

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
    }).catch(reason => {
      this.terminal.error(reason);
    });
  }
}

/**
 * Given a list of files, return a list of folders leading up to those file names.
 *  Example:
 *    Given: ['example/js/1.js', 'example/js/2/.js']
 *    Will Return: ['example/', 'example/js/', 'example/js/1.js', 'example/js/2/.js']
 *
 * @param {string[]} files
 * @returns {string[]}
 */
function getUniqueFileFolders(files: string[]): string[] {
  const folders: string[] = [];
  const seen: Map<string, void> = new Map();

  for (let file of files) {
    let folderParts = file.split('/');
    let folderPartsSum = '';
    for (let folderPart of folderParts) {
      if (folderPartsSum.length > 0) {
        folderPartsSum += '/';
      }
      folderPartsSum += folderPart;
      if (!seen.has(folderPartsSum)) {
        seen.set(folderPartsSum, undefined);
        folders.push(folderPartsSum);
      }
    }
  }
  return folders;
}

/*
 * Return whether a value starts with a searchString in the given values array
 *
 * @param {string[]} values
 * @param {string} searchString
 * @returns {boolean}
 */
function exists(values: string[], stringToSearch: string): boolean {
  for (let value of values) {
    if (startsWith(stringToSearch, value)) {
      return true;
    }
  }
  return false;
}

/**
 * Return whether a string starts with another string
 *
 * @param {string} value
 * @param {string} search
 * @returns {boolean}
 */
function startsWith(value: string, searchString: string): boolean {
  return value.substr(0, searchString.length) === searchString;
}
