import { ChildProcess } from 'child_process';
import { inject, injectable } from 'inversify';
import { Config, Spawn, SubConfig, Sync, Terminal } from '../interfaces';
import { Bindings } from './ioc.bindings';

const windowsDriveRegex = /([a-zA-Z]):\\/;

@injectable()
export class SyncImpl implements Sync {
  private readonly processes: Set<ChildProcess>;

  constructor(
    @inject(Bindings.Config)
    private readonly config: Config,
    @inject(Bindings.Terminal)
    private readonly terminal: Terminal,
    @inject(Bindings.Spawn)
    private readonly spawn: Spawn,
  ) {
    this.processes = new Set<ChildProcess>();
  }

  public syncFiles(subConfig: SubConfig, filesNames?: string[]): Promise<void> {
    const ignoreFolders = subConfig.ignoreFolders;

    // remove files that are in the ignore folders
    const files = (filesNames || []).filter(file => !exists(ignoreFolders, file));

    // if there are too many files, it might just be better to let rsync figure out what
    // needs to be synced
    if (files.length > 0 && files.length < this.config.maxFileLength) {
      return this._syncSpecificFiles(subConfig, files);
    } else {
      return this._syncAllFiles(subConfig);
    }
  }

  public end() {
    const { processes, terminal } = this;

    /* istanbul ignore else */
    if (processes.size > 0) {
      terminal.debug(`sync: kill rsync`);
      processes.forEach(proc => {
        proc.kill();
      });
    }
  }

  private _syncAllFiles(subConfig: SubConfig): Promise<void> {
    const { destination, ignoreFolders, source } = subConfig;
    const normalizedSource = this.osNormalizePath(source);
    const excludes = (`--exclude '${ignoreFolders.join(`' --exclude '`)}'`).split(' ');
    const args = ['-avz', '--delete'].concat(excludes, [normalizedSource, destination]);

    return this._exec(args);
  }

  private _syncSpecificFiles(subConfig: SubConfig, files: string[]): Promise<void> {
    files = getUniqueFileFolders(files).concat(files);
    const { destination, source } = subConfig;
    const normalizedSource = this.osNormalizePath(source);
    const includes = (`--include '${files.join(`' --include '`)}'`).split(' ');
    const args = ['-avz', '--delete'].concat(includes, ['--exclude', `'*'`, normalizedSource, destination]);

    return this._exec(args);
  }

  private _exec(args: string[]): Promise<void> {
    const { spawn, config, terminal } = this;
    const cmdAndArgs = config.rsyncCmd + ' ' + args.join(' ');
    terminal.debug(cmdAndArgs);

    return new Promise<void>((resolve, reject) => {
      const child = spawn(config.shell, ['-c', cmdAndArgs]);
      const errBuffer: string[] = [];
      this.processes.add(child);
      const done = (code: number) => {
        this.processes.delete(child);
        code > 0 ? reject(errBuffer.join('\n')) : resolve();
      };

      child.stderr.on('data', (data: Buffer | string) => {
        data = toString(data);
        errBuffer.push(data);
        terminal.debug(data);
      });
      child.stdout.on('data', (data: Buffer | string) => {
        terminal.debug(toString(data));
      });
      child.on('exit', done);
      child.on('close', done);
      child.on('error', (err) => {
        this.processes.delete(child);
        reject(err);
      });
    });
  }

  private osNormalizePath(path: string): string {
    if (windowsDriveRegex.test(path)) {
      path = path.replace(windowsDriveRegex, '/mnt/$1/');
      path = path.replace(/\\/, '/');
      this.terminal.debug(path);
      path = path.endsWith('/') ? path : path += '/';
    }
    return path;
  }

}

/**
 * Convert Buffer to string
 */
function toString(data: Buffer | string) {
  /* istanbul ignore next */
  return data instanceof Buffer ? data.toString('utf8') : data;
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
    const folderParts = file.split(/\/|\\/);
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
