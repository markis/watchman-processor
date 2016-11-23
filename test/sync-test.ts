import 'ts-helpers';

import * as chai from 'chai';
import * as sinon from 'sinon';

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

  it('should sync to rsync specific files', sinon.test(() => {

    // Setup
    const shortList = [
      'example1/js/1.js',
      'example1/js/2.js',
    ];
    const spawn = sinon.stub().returns({on: sinon.stub(), stdout: {on: sinon.stub().callsArg(1)}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    chai.assert(spawn.called);
  }));

  it('should sync to rsync all files when too many files are sent', () => {

    // Setup
    const longList = new Array(1000);
    for (let i = 0, length = longList.length; i < length; i++) {
      longList[i] = 'example1/' + i + '.js' ;
    }
    const spawn = sinon.stub();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, longList);

    chai.assert(spawn.called);
  });

  it('should sync to rsync all files when no files are sent', () => {

    // Setup
    const spawn = sinon.stub();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1);

    chai.assert(spawn.called);
  });

  it('should sync to rsync ignore specific files', sinon.test(() => {

    // Setup
    const shortList = [
      'example1/js/1.js',
      '.git/js/2.js',
    ];
    const spawn = sinon.stub().returns({on: sinon.stub(), stdout: {on: sinon.stub()}});
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    chai.assert(spawn.called);
  }));
});
