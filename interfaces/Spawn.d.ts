import { ChildProcess } from 'child_process';

export type Spawn = (cmd: string, args: string[]) => ChildProcess;
