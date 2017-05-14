import { assert } from 'chai';
import 'reflect-metadata';
import { stub } from 'sinon';
import 'ts-helpers';
import { Config } from '../interfaces';
import Sync from '../src/sync';
import Terminal from '../src/terminal';

function noop() {
  // do nothing
}
const terminal: Terminal = { debug: noop, error: noop } as any;
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
const example1 = config.subscriptions.example1;

describe('Sync', () => {

  it('should sync to rsync specific files', () => {

    // Setup
    const shortList = [
      'example1/js/1.js',
      'example1/js/2.js',
    ];
    const onData = stub().callsArgWith(1, '');
    const onExit = stub();
    const spawn = stub().returns({on: onExit, stderr: {on: onData}, stdout: {on: onData}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    onExit.callArgWith(1, 0);
    onExit.callArgWith(1, 255);

    assert(spawn.called);
  });

  it('should sync to rsync all files when too many files are sent', () => {

    // Setup
    const longList = new Array(1000);
    for (let i = 0, length = longList.length; i < length; i++) {
      longList[i] = 'example1/' + i + '.js' ;
    }
    const spawn = stub().returns({on: stub(), stderr: {on: stub()}, stdout: {on: stub()}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, longList);

    assert(spawn.called);
  });

  it('should sync to rsync all files when no files are sent', () => {

    // Setup
    const spawn = stub().returns({on: stub(), stderr: {on: stub()}, stdout: {on: stub()}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1);

    assert(spawn.called);
  });

  it('should sync to rsync ignore specific files', () => {

    // Setup
    const shortList = [
      'example1/js/1.js',
      '.git/js/2.js',
    ];
    const spawn = stub().returns({on: stub(), stderr: {on: stub()}, stdout: {on: stub()}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    assert(spawn.called);
  });

  it('should kill running processes', () => {

    // Setup
    const killStub = stub();
    const processes: any = new Set([{ kill: killStub }]);
    const spawn = stub().returns({on: stub(), stderr: {on: stub()}, stdout: {on: stub()}});
    const sync = new Sync(config, terminal, spawn);
    /* tslint:disable-next-line:no-string-literal */
    sync['processes'] = processes;

    // Execute
    sync.end();

    assert(killStub.called);
  });
});
