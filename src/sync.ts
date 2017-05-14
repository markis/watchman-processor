import { ChildProcess } from 'child_process';
import { inject, injectable } from 'inversify';
import { Config, Spawn, SubConfig, Sync, Terminal } from '../interfaces';

@injectable()
export default class SyncImpl implements Sync {
  private rsyncCmd: string;
  private maxFileLength: number;
  private shell: string;

  constructor(
    @inject('Config')
    private config: Config,
    @inject('Terminal')
    private terminal: Terminal,
    @inject('spawn')
    private spawn: Spawn,
    private processes = new Set<ChildProcess>(),
  ) {
    this.rsyncCmd = this.config && this.config.rsyncCmd || 'rsync';
    this.maxFileLength = this.config && this.config.maxFileLength || 100;
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

  public end() {
    this.processes.forEach(proc => {
      proc.kill();
    });
  }

  private _syncAllFiles(subConfig: SubConfig): Promise<void> {
    const { destination, ignoreFolders, source } = subConfig;
    const excludes = (`--exclude '${ignoreFolders.join(`' --exclude '`)}'`).split(' ');
    const args = ['-avz', '--delete'].concat(excludes, [source, destination]);

    return this._exec(args);
  }

  private _syncSpecificFiles(subConfig: SubConfig, files: string[]): Promise<void> {
    files = getUniqueFileFolders(files).concat(files);
    const { destination, source } = subConfig;
    const includes = (`--include '${files.join(`' --include '`)}'`).split(' ');
    const args = ['-avz', '--delete'].concat(includes, ['--exclude', `'*'`, source, destination]);

    return this._exec(args);
  }

  private _exec(args: string[]): Promise<void> {
    const { spawn, rsyncCmd, terminal, shell } = this;
    const cmdAndArgs = rsyncCmd + ' ' + args.join(' ');
    terminal.debug(cmdAndArgs);

    return new Promise<void>((resolve, reject) => {
      const child = spawn(shell, ['-c', cmdAndArgs]);
      const errBuffer: string[] = [];
      this.processes.add(child);
      const done = (code: number) => {
        code > 0 ? reject(errBuffer.join('\n')) : resolve();
        this.processes.delete(child);
      };

      child.stderr.on('data', (data: string) => {
        errBuffer.push(data);
        terminal.debug(data);
      });
      child.stdout.on('data', (data: string) => {
        terminal.debug(data);
      });
      child.on('exit', done);
      child.on('close', done);
      child.on('error', (err) => {
        reject(err);
        this.processes.delete(child);
      });
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

  for (const file of files) {
    const folderParts = file.split('/');
    let folderPartsSum = '';
    for (const folderPart of folderParts) {
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
  for (const value of values) {
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
