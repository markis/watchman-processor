import { assert } from 'chai';
import 'reflect-metadata';
import { stub } from 'sinon';
import 'ts-helpers';
import { Config } from '../interfaces';
import Terminal, { StdErrWriteImpl, StdOutWriteImpl } from '../src/terminal';

function noop() {
  // do nothing
}

describe('Terminal', () => {
  let config: Config;
  const mockEmoji: Emoji = { emojify: noop } as any;
  const mockChalk = {
      bgGreen: this,
      bgRed: this,
      bgWhite: this,
      bgYellow: this,
      black: noop,
      red: noop,
      white: noop,
    };
  let stdOutWrite = stub();
  let stdErrWrite = stub();

  mockChalk.bgGreen = mockChalk;
  mockChalk.bgRed = mockChalk;
  mockChalk.bgYellow = mockChalk;
  mockChalk.bgWhite = mockChalk;

  beforeEach(() => {
    stdOutWrite = stub();
    stdErrWrite = stub();

    config = {
      emoji: true,
      subscriptions: {
        example1: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'initial',
          type: 'rsync',
        },
        example2: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'good',
          type: 'rsync',
        },
        example3: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'running',
          type: 'rsync',
        },
        example4: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'error',
          type: 'rsync',
        },
      },
    };
  });

  it('Expect terminal.error to execute stdErrWrite', () => {
    // Setup
    const terminal = new Terminal(config, noop, stdErrWrite, mockChalk);

    // Execute
    terminal.error('err');

    assert(stdErrWrite.called);
  });

  it('Expect terminal.debug to execute stdOutWrite', () => {
    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.debug('err');

    assert(stdOutWrite.called);
  });

  it('Expect terminal.debug to handle nulls', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.debug('');

  });

  it('Expect terminal.render to render', () => {
    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.render();

    assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render without emojis', () => {
    // Setup
    config.emoji = false;
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.render();

    assert(stdOutWrite.called);
  });

  it('Expect terminal.render to do nothing when debug is turned on', () => {

    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.render();

    assert(stdOutWrite.notCalled);
  });

  it('Expect terminal.setState to execute', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.setState(config.subscriptions.example1, 'good');

  });

  it('Expect terminal.start to start', () => {

    // Setup
    const startConfig = { debug: false };
    const terminal = new Terminal(startConfig, stdOutWrite, noop, mockChalk);

    // Execute with debug on
    startConfig.debug = false;
    terminal.start();

    // Execute with debug on
    startConfig.debug = true;
    terminal.start();

  });

  it('Expect terminal.error to handle non-strings', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk);

    // Execute
    terminal.error(new Error());

  });

  it('should execute the std*write methods', () => {
    StdErrWriteImpl('');
    StdOutWriteImpl('');
  });

});
