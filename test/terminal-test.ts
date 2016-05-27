import {Config} from '../lib/config';
import Terminal from '../src/terminal';
import * as chai from 'chai';
import * as sinon from 'sinon';
import SinonMock = Sinon.SinonMock;
import SinonStub = Sinon.SinonStub;

const emoji = require('node-emoji') as Emoji;
const chalk = require('chalk') as Chalk;

function noop() {
  // do nothing
}

describe('Terminal', () => {
  let config: Config, mockEmoji: SinonMock, mockChalk: SinonMock,
    stdOutWrite: SinonStub, stdErrWrite: SinonStub;
  
  beforeEach(() => {
    mockChalk = sinon.mock(chalk);
    mockEmoji = sinon.mock(emoji);
    stdOutWrite = sinon.stub();
    stdErrWrite = sinon.stub();

    config = {
      emoji: true,
      subscriptions: {
        example1: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'initial',
          type: 'rsync'
        },
        example2: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'good',
          type: 'rsync'
        },
        example3: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'running',
          type: 'rsync'
        },
        example4: {
          destination: 'user@server:/tmp/example1/',
          source: 'example1',
          state: 'error',
          type: 'rsync'
        }
      }
    };
  });

  it('Expect terminal.error to execute stdErrWrite', function () {
    // Setup
    const terminal = new Terminal(config, noop, stdErrWrite, mockChalk.object, null);

    // Execute
    terminal.error('err');

    chai.assert(stdErrWrite.called);
  });

  it('Expect terminal.debug to execute stdOutWrite', function () {
    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk.object, null);

    // Execute
    terminal.debug('err');
    
    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render', function () {
    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk.object, mockEmoji.object);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to render without emojis', () => {
    // Setup
    config.emoji = false;
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk.object, mockEmoji.object);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.called);
  });

  it('Expect terminal.render to do nothing when debug is turned on', () => {

    // Setup
    const terminal = new Terminal({ debug: true }, stdOutWrite, noop, mockChalk.object, mockEmoji.object);

    // Execute
    terminal.render();

    chai.assert(stdOutWrite.notCalled);
  });

  it('Expect terminal.setState to execute', () => {

    // Setup
    const terminal = new Terminal(config, stdOutWrite, noop, mockChalk.object, mockEmoji.object);

    // Execute
    terminal.setState(config.subscriptions.example1, 'good');

  });

  it('Expect terminal.start to start', () => {

    // Setup
    const startConfig = { debug: false };
    const terminal = new Terminal(startConfig, stdOutWrite, noop, mockChalk.object, mockEmoji.object);

    // Execute with debug on
    startConfig.debug = false;
    terminal.start();

    // Execute with debug on
    startConfig.debug = true;
    terminal.start();

  });

});

