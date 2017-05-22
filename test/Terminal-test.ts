import { assert } from 'chai';
import { stub } from 'sinon';
import { Config, Write } from '../interfaces';
import { TerminalImpl as Terminal } from '../src/Terminal';
const noop: Write = stub();

describe('Terminal', () => {
  let config: Config;
  let stdOutWrite = stub();
  let stdErrWrite = stub();
  const startConfig = { debug: false, subscriptions: {} } as any;

  beforeEach(() => {
    stdOutWrite = stub();
    stdErrWrite = stub();

    config = {
      emoji: true,
      subscriptions: {
        example1: {
          destination: 'user@server:/tmp/example1/',
          ignoreFolders: [],
          source: 'example1',
          state: undefined,
          type: 'rsync',
        },
        example2: {
          destination: 'user@server:/tmp/example1/',
          ignoreFolders: [],
          source: 'example1',
          state: 'good',
          type: 'rsync',
        },
        example3: {
          destination: 'user@server:/tmp/example1/',
          ignoreFolders: [],
          source: 'example1',
          state: 'running',
          type: 'rsync',
        },
        example4: {
          destination: 'user@server:/tmp/example1/',
          ignoreFolders: [],
          source: 'example1',
          state: 'error',
          type: 'rsync',
        },
      },
    } as any;
  });

  it('Expect terminal.error to execute stdErrWrite', () => {
    // Setup
    const terminal = new Terminal(config, noop, stdErrWrite);

    // Execute
    terminal.error('err');

    assert(stdErrWrite.called);
  });

  it('Expect terminal.debug to execute stdOutWrite', () => {
    // Setup
    const terminal = new Terminal(startConfig, stdOutWrite, noop);

    // Execute
    terminal.debug('err');
  });

  it('Expect terminal.debug to handle nulls', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.debug('');

  });

  it('Expect terminal.render to render', () => {
    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.render();

    assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render without emojis', () => {
    // Setup
    config.emoji = false;
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.render();

    assert(stdOutWrite.called);
  });

  it('Expect terminal.render to do nothing when debug is turned on', () => {

    // Setup
    const terminal = new Terminal(startConfig, stdOutWrite, noop);

    // Execute
    terminal.render();
  });

  it('Expect terminal.setState to execute', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.setState(config.subscriptions.example1, 'good');

  });

  it('Expect terminal.setState to execute wih an error state', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.setState(config.subscriptions.example1, 'error', 'Fake Error Status');

  });

  it('Expect terminal.debug to write', () => {

    // Setup
    const terminal = new Terminal(startConfig, stdOutWrite, noop);

    // Execute with debug on
    startConfig.debug = false;
    terminal.debug('should not write');

    // Execute with debug on
    startConfig.debug = true;
    terminal.debug('should write');

  });

  it('Expect terminal.error to handle non-strings', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop);

    // Execute
    terminal.error(new Error());

  });

});
