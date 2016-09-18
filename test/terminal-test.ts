import 'ts-helpers';
import { Config } from '../src/config';
import Terminal from '../src/terminal';
import * as chai from 'chai';
import * as sinon from 'sinon';

function noop() {
  // do nothing
}

describe('Terminal', () => {
  let config: Config;
  let mockEmoji: Emoji = { emojify: noop } as any;
  let mockChalk = {
      bgGreen: this,
      bgRed: this,
      bgWhite: this,
      bgYellow: this,
      black: noop,
      red: noop,
      white: noop,
    };
  let stdOutWrite = sinon.stub();
  let stdErrWrite = sinon.stub();

  mockChalk.bgGreen = mockChalk;
  mockChalk.bgRed = mockChalk;
  mockChalk.bgYellow = mockChalk;
  mockChalk.bgWhite = mockChalk;

  beforeEach(() => {
    stdOutWrite = sinon.stub();
    stdErrWrite = sinon.stub();

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

  it('Expect terminal.error to execute stdErrWrite', function () {
    // Setup
    const terminal = new Terminal(config, noop, stdErrWrite, mockChalk, null);

    // Execute
    terminal.error('err');

    chai.assert(stdErrWrite.called);
  });

  it('Expect terminal.debug to execute stdOutWrite', function () {
    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk, null);

    // Execute
    terminal.debug('err');

    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render', function () {
    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk, mockEmoji);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render without emojis', () => {
    // Setup
    config.emoji = false;
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk, mockEmoji);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to do nothing when debug is turned on', () => {

    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk, mockEmoji);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.notCalled);
  });

  it('Expect terminal.setState to execute', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk, mockEmoji);

    // Execute
    terminal.setState(config.subscriptions.example1, 'good');

  });

  it('Expect terminal.start to start', () => {

    // Setup
    const startConfig = { debug: false };
    const terminal = new Terminal(startConfig, stdOutWrite, noop, mockChalk, mockEmoji);

    // Execute with debug on
    startConfig.debug = false;
    terminal.start();

    // Execute with debug on
    startConfig.debug = true;
    terminal.start();

  });

});
