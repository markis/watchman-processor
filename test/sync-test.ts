import 'ts-helpers';

import { assert } from 'chai';
import { stub } from 'sinon';

import { Config } from '../src/config';
import Sync from '../src/sync';
import Terminal from '../src/terminal';

function noop() {
  // do nothing
}
const terminal: Terminal = { debug: noop } as any;
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
    const spawn = stub().returns({on: stub(), stdout: {on: stub().callsArg(1)}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    assert(spawn.called);
  });

  it('should sync to rsync all files when too many files are sent', () => {

    // Setup
    const longList = new Array(1000);
    for (let i = 0, length = longList.length; i < length; i++) {
      longList[i] = 'example1/' + i + '.js' ;
    }
    const spawn = stub();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, longList);

    assert(spawn.called);
  });

  it('should sync to rsync all files when no files are sent', () => {

    // Setup
    const spawn = stub();
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
    const spawn = stub().returns({on: stub(), stdout: {on: stub()}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    assert(spawn.called);
  });
});
