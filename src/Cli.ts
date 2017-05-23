import { inject, injectable } from 'inversify';
import { resolve } from 'path';
import { Arguments, Cli } from '../interfaces';
import { Bindings } from './ioc.bindings';

const DEFAULT_ARGUMENTS: Arguments = {
  config: '',
  init: false,
};

@injectable()
export class CliImpl implements Cli {
  constructor(
    @inject(Bindings.Process)
    private readonly process: NodeJS.Process,
  ) { }

  public getArguments(): Arguments {
    const userArgs: Arguments = Object.assign({}, DEFAULT_ARGUMENTS);
    const args = this.process.argv;

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      switch (arg) {
        case '-i':
        case '--init':
          userArgs.init = true;
          break;

        case '-c':
        case '--config':
          userArgs.config = this.parseConfigFile(i, args);
          break;

        default:
          break;
      }
    }

    return userArgs;
  }

  private parseConfigFile(i: number, args: string[]): string {
    if (i + 1 < args.length) {
      return resolve(args[i + 1]);
    }
    return this.process.cwd() + '/.watchman-processor.config.js';
  }
}
