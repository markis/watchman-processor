import 'ts-helpers';
import { Config } from '../src/config';
import Terminal from '../src/terminal';
import Sync from '../src/sync';
import Watchman from '../src/watchman';
import * as fbWatchmanClient from 'fb-watchman';
import * as chai from 'chai';
import * as sinon from 'sinon';

const mockTerminal = sinon.mock(Terminal);
const terminal = new mockTerminal.object();
const mockSync = sinon.mock(Sync);
const sync = new mockSync.object();
const mockWatchmanClient = sinon.mock(fbWatchmanClient);
const watchmanClient = mockWatchmanClient.object;
const config: Config = {
  subscriptions: {
    example1: {
      destination: 'user@server:/tmp/example1/',
      ignoreFolders: ['.git'],
      source: 'example1',
      type: 'rsync'
    }
  }
};

describe('Watchman', function () {
  
  beforeEach(function() {
    // mock all the default before
    terminal.start = sinon.stub();
    terminal.render = sinon.stub();
    terminal.error = sinon.stub();
    
    sync.syncFiles = sinon.stub();
    sync.syncFiles.returns(new Promise(resolve => resolve()));
    
    watchmanClient.capabilityCheck = sinon.stub();
    watchmanClient.capabilityCheck.callsArg(1);
    watchmanClient.on = sinon.stub();
    watchmanClient.on.callsArgWith(1, {files: [], subscription: 'example1'});
    watchmanClient.command = sinon.stub();
    watchmanClient.command.callsArg(1);
  });

  it('should start watchman', function () {
    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.capabilityCheck', function () {
    watchmanClient.capabilityCheck.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.command', function () {
    watchmanClient.command.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from sync.syncFiles', function () {
    sync.syncFiles.returns(new Promise(() => { throw 'error'; }));

    const watchman = new Watchman(config, watchmanClient, terminal, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

});

