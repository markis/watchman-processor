import { assert } from 'chai';
import { spy } from 'sinon';
import { Terminal } from '../interfaces';
import { Bindings } from '../src/ioc.bindings';
import { container } from './ioc-test';

let write = spy();
let fakeConfig = {} as any;

describe('Terminal', () => {
  beforeEach(() => {
    container.snapshot();
    write = spy();

    const process: any = container.get(Bindings.Process);
    process.stderr.write = write;
    process.stdout.write = write;
    container.rebind(Bindings.Process).toConstantValue(process);

    fakeConfig = {
      debug: true,
      subscriptions: {
        example1: {
          state: undefined,
        },
        example2: {
          state: 'good',
        },
        example3: {
          state: 'running',
        },
        example4: {
          state: 'error',
          statusMessage: 'error',
        },
      },
    };

    container.rebind(Bindings.ConfigManager).toConstantValue({ getConfig: () => fakeConfig });
  });

  afterEach(() => {
    container.restore();
  });

  it('should execute terminal.debug when debug = true', () => {
    fakeConfig.debug = true;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.debug('err');

    assert.isTrue(write.called);
  });

  it('should not execute terminal.debug when debug = false', () => {
    fakeConfig.debug = false;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.debug('err');

    assert.isTrue(write.notCalled);
  });

  it('should execute terminal.error', () => {
    // Setup
    fakeConfig.debug = true;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.error('err');

    assert.isTrue(write.called);
  });

  it('should execute terminal.render', () => {
    // Setup
    fakeConfig.debug = false;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.render();

    assert.isTrue(write.called);
  });

  it('should be able to render without emojis', () => {
    // Setup
    fakeConfig.debug = false;
    fakeConfig.emoji = false;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.render();
    terminal.setState(fakeConfig.subscriptions.example1, 'good');

    assert.isTrue(write.called);
  });

  it('should have terminal.render do nothing with debug is enabled', () => {
    // Setup
    fakeConfig.debug = true;
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.render();

    assert.isFalse(write.called);
  });

  it('should set state on a subscription', () => {
    // Setup
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.setState(fakeConfig.subscriptions.example1, 'good');

  });

  it('should set state on an errored subscription', () => {

    // Setup
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.setState(fakeConfig.subscriptions.example1, 'error', 'Fake Error Status');

  });

  it('should render errors', () => {

    // Setup
    const terminal = container.get<Terminal>(Bindings.Terminal);

    // Execute
    terminal.error(new Error());

  });

  // let config: Config;
  // let stdOutWrite = stub();
  // let stdErrWrite = stub();
  // const startConfig = { debug: false, subscriptions: {} } as any;

  // beforeEach(() => {
  //   stdOutWrite = stub();
  //   stdErrWrite = stub();

  //   config = {
  //     emoji: true,
  //     subscriptions: {
        // example1: {
        //   destination: 'user@server:/tmp/example1/',
        //   ignoreFolders: [],
        //   source: 'example1',
        //   state: undefined,
        //   type: 'rsync',
        // },
        // example2: {
        //   destination: 'user@server:/tmp/example1/',
        //   ignoreFolders: [],
        //   source: 'example1',
        //   state: 'good',
        //   type: 'rsync',
        // },
        // example3: {
        //   destination: 'user@server:/tmp/example1/',
        //   ignoreFolders: [],
        //   source: 'example1',
        //   state: 'running',
        //   type: 'rsync',
        // },
        // example4: {
        //   destination: 'user@server:/tmp/example1/',
        //   ignoreFolders: [],
        //   source: 'example1',
        //   state: 'error',
        //   type: 'rsync',
        // },
  //     },
  //   } as any;
  // });

  // it('Expect terminal.debug to execute stdOutWrite', () => {
  //   // Setup
  //   const terminal = new Terminal(startConfig, stdOutWrite, noop);

  //   // Execute
  //   terminal.debug('err');
  // });

  // it('Expect terminal.debug to handle nulls', () => {

  //   // Setup
  //   const terminal = new Terminal(config, stdOutWrite, noop);

  //   // Execute
  //   terminal.debug('');

  // });

  // it('Expect terminal.render to render', () => {
  //   // Setup
  //   const terminal = new Terminal(config, stdOutWrite, noop);

  //   // Execute
  //   terminal.render();

  //   assert(stdOutWrite.called);
  // });

  // it('Expect terminal.render to render without emojis', () => {
  //   // Setup
  //   config.emoji = false;
  //   const terminal = new Terminal(config, stdOutWrite, noop);

  //   // Execute
  //   terminal.render();

  //   assert(stdOutWrite.called);
  // });

  // it('Expect terminal.render to do nothing when debug is turned on', () => {

  //   // Setup
  //   const terminal = new Terminal(startConfig, stdOutWrite, noop);

  //   // Execute
  //   terminal.render();
  // });

  // it('Expect terminal.setState to execute', () => {

  //   // Setup
  //   const terminal = new Terminal(config, stdOutWrite, noop);

  //   // Execute
  //   terminal.setState(config.subscriptions.example1, 'good');

  // });

  // it('Expect terminal.debug to write', () => {

  //   // Setup
  //   const terminal = new Terminal(startConfig, stdOutWrite, noop);

  //   // Execute with debug on
  //   startConfig.debug = false;
  //   terminal.debug('should not write');

  //   // Execute with debug on
  //   startConfig.debug = true;
  //   terminal.debug('should write');

  // });

  // it('Expect terminal.error to handle non-strings', () => {

  //   // Setup
  //   const terminal = new Terminal(config, stdOutWrite, noop);

  //   // Execute
  //   terminal.error(new Error());

  // });

});
