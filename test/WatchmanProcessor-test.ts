import * as chai from 'chai';
import { EventEmitter } from 'events';
import { Client } from 'fb-watchman';
import 'reflect-metadata';
import * as sinon from 'sinon';
import 'ts-helpers';
import { Config } from '../interfaces';
import { SyncImpl as Sync } from '../src/Sync';
import { WatchmanProcessorImpl as Watchman } from '../src/WatchmanProcessor';

const mockEventEmitter = sinon.mock(EventEmitter);
const emitter = mockEventEmitter as any;
const mockSync = {
  end: sinon.stub(),
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
const watchmanClient: Client = mockWatchmanClient as any;
const config: Config = {
  subscriptions: {
    example1: {
      destination: 'user@server:/tmp/example1/',
      ignoreFolders: ['.git'],
      source: 'example1',
      type: 'rsync',
    },
  },
} as any;

describe('Watchman', () => {

  beforeEach(() => {
    // mock all the defaults before
    emitter.emit = sinon.spy();

    mockSync.syncFiles = sinon.stub().returns(new Promise(resolve => resolve()));
    mockWatchmanClient.capabilityCheck = sinon.stub().callsArg(1);
    mockWatchmanClient.on = sinon.stub().callsArgWith(1, {files: [{name: 'example.js'}], subscription: 'example1'});
    mockWatchmanClient.command = sinon.stub().callsArg(1);
  });

  it('should start watchman', () => {
    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.capabilityCheck', () => {
    mockWatchmanClient.capabilityCheck.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.start();

    chai.assert.deepEqual(emitter.emit.getCall(0).args, ['debug', { msg: 'watchman: initialize' }]);
    chai.assert.deepEqual(emitter.emit.getCall(1).args, ['error', { err: 'error' }]);
    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from watchman.command', () => {
    mockWatchmanClient.command.callsArgWith(1, 'error');

    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.start();

    chai.assert.deepEqual(emitter.emit.getCall(0).args, ['debug', { msg: 'watchman: initialize' }]);
    chai.assert.deepEqual(emitter.emit.getCall(1).args, ['render']);
    chai.assert.deepEqual(emitter.emit.getCall(2).args, ['debug', { msg: 'subscribe: example1' }]);
    chai.assert.deepEqual(emitter.emit.getCall(3).args, ['setState',
      { subscription: 'example1', configEntry: config.subscriptions.example1, state: 'running' }]);
    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should log errors from sync.syncFiles', () => {
    mockSync.syncFiles.returns(new Promise(() => { throw new Error('error'); }));

    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should attempt to sync files', () => {
    mockWatchmanClient.on = sinon.stub().callsArgWith(1, {subscription: 'example1'});
    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.start();

    chai.assert.isObject(watchman, 'watchman is an object');
  });

  it('should end', () => {
    mockWatchmanClient.end = sinon.stub();
    const watchman = new Watchman(config, watchmanClient, emitter, sync);
    watchman.end();

    chai.assert.deepEqual(emitter.emit.getCall(0).args, ['debug', { msg: 'unsubscribe: example1' }]);
  });

  it('should end and shutdown', () => {
    mockWatchmanClient.end = sinon.stub();
    const newConfig = { controlWatchman: true, subscriptions: {} } as any;
    const watchman = new Watchman(newConfig, watchmanClient, emitter, sync);
    watchman.end();
  });

});
