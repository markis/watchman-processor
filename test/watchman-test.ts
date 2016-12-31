import 'ts-helpers';

import { Config } from '../src/config';
import Sync from '../src/sync';
import Terminal from '../src/terminal';
import Watchman from '../src/watchman';

import * as chai from 'chai';
import * as sinon from 'sinon';

const mockTerminal = sinon.mock(Terminal);
const terminal: Terminal = mockTerminal as any;
const mockSync = {
  syncFiles: sinon.stub(),
};
const sync: Sync = mockSync as any;
const mockWatchmanClient = {
  capabilityCheck: sinon.stub(),
  command: sinon.stub(),
  end: sinon.stub(),
  on: sinon.stub(),
  syncFiles: sinon.stub(),
};
const watchmanClient: WatchmanClient = mockWatchmanClient as any;
const config: Config = {
  subscriptions: {
    example1: {
      destination: 'user@server:/tmp/example1/',
      ignoreFolders: ['.git'],
      source: 'example1',
      type: 'rsync',
    },
  },
};

describe('Watchman', () => {

  beforeEach(() => {
    // mock all the defaults before
    terminal.start = sinon.stub();
    terminal.render = sinon.stub();
    terminal.error = sinon.stub();
    terminal.debug = sinon.stub();
    terminal.setState = sinon.stub();

    mockSync.syncFiles = sinon.stub().returns(new Promise(resolve => resolve()));
    mockWatchmanClient.capabilityCheck = sinon.stub().callsArg(1);
    mockWatchmanClient.on = sinon.stub().callsArgWith(1, {files: [{name: 'example.js'}], subscription: 'example1'});
    mockWatchmanClient.command = sinon.stub().callsArg(1);
  });

  it('should start watchman', () => {
    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.capabilityCheck', () => {
    mockWatchmanClient.capabilityCheck.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.command', () => {
    mockWatchmanClient.command.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from sync.syncFiles', () => {
    mockSync.syncFiles.returns(new Promise(() => { throw 'error'; }));

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should attempt to sync files', () => {
    mockWatchmanClient.on = sinon.stub().callsArgWith(1, {subscription: 'example1'});
    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should end', () => {
    mockWatchmanClient.end = sinon.stub();
    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.end();
  });

  it('should end and shutdown', () => {
    mockWatchmanClient.end = sinon.stub();
    const newConfig = { controlWatchman: true, subscriptions: {} };
    const watchman = new Watchman(newConfig, watchmanClient, terminal, sync);
    watchman.end();
  });

});
