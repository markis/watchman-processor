import 'ts-helpers';
import { Config } from '../src/config';
import Terminal from '../src/terminal';
import Sync from '../src/sync';
import * as chai from 'chai';
import * as sinon from 'sinon';

const mockTerminal = sinon.mock(Terminal);
const config: Config = {
  subscriptions: {
    example1: {
      destination: 'user@server:/tmp/example1/',
      source: 'example1',
      type: 'rsync'
    }
  }
};
const example1 = config.subscriptions.example1;

describe('Sync', function () {

  it('should sync to rsync specific files', sinon.test(function () {

    // Setup
    const shortList = [
      {name: 'example1/js/1.js'},
      {name: 'example1/js/2.js'}
    ];
    const spawn = sinon.stub().returns({on: sinon.stub(), stdout: {on: sinon.stub()}});
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, shortList);

    chai.assert(spawn.called);
  }));

  it('should sync to rsync all files when too many files are sent', function () {

    // Setup
    const longList = new Array(1000);
    for (let i = 0, length = longList.length; i < length; i++) {
      longList[i] = { name: 'example1/' + i + '.js' };
    }
    const spawn = sinon.stub();
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1, longList);
    
    chai.assert(spawn.called);
  });

  it('should sync to rsync all files when no files are sent', function () {

    // Setup
    const spawn = sinon.stub();
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, spawn);

    // Execute
    sync.syncFiles(example1);

    chai.assert(spawn.called);
  });
});

