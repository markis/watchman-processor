import { spawn } from 'child_process';
import { Client } from 'fb-watchman';
import { mock, stub } from 'sinon';
import { Bindings } from '../src/ioc.bindings';
import { container } from '../src/ioc.config';

const mockProcess = {
  argv: [],
  env: {
    HOME: __dirname,
    USERPROFILE: __dirname,
  },
  platform: '',
  stderr: {
    write: stub(),
  },
  stdout: {
    write: stub(),
  },
};

// rebind all external objects to mocks and stubs
container.rebind(Bindings.Process).toConstantValue(mockProcess);
container.rebind(Bindings.Spawn).toConstantValue(mock(spawn));
container.rebind(Bindings.WatchmanClient).toConstantValue(mock(new Client()));

export { container };

export function setArgs(...args: string[]) {
  container.rebind(Bindings.Process).toConstantValue(Object.assign({}, mockProcess, { argv: args }));
}
