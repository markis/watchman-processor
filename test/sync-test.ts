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

  it('Expect sync to rsync specific files', function () {

    // Setup
    const shortList = [
      {name: 'example1/js/1.js'},
      {name: 'example1/js/2.js'}
    ];
    const exec = sinon.stub();
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, exec);

    // Execute
    sync.syncFiles(example1, shortList);
    exec.callArg(2);

    chai.assert(exec.called);
    chai.expect(exec.firstCall.args[0]).to.contain('rsync');
    chai.expect(exec.firstCall.args[0]).to.contain('--include');
  });

  it('Expect sync to rsync all files when too many files are sent', function () {

    // Setup
    const longList = new Array(1000);
    for (let i = 0, length = longList.length; i < length; i++) {
      longList[i] = { name: 'example1/' + i + '.js' };
    }
    const exec = sinon.stub();
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, exec);

    // Execute
    sync.syncFiles(example1, longList);
    exec.callArg(2);
    
    chai.assert(exec.called);
    chai.expect(exec.firstCall.args[0]).to.contain('rsync');
    chai.expect(exec.firstCall.args[0]).to.not.contain('--include');
  });

  it('Expect sync to rsync all files when no files are sent', function () {

    // Setup
    const exec = sinon.stub();
    const terminal = new mockTerminal.object();
    const sync = new Sync(config, terminal, exec);

    // Execute
    sync.syncFiles(example1);
    exec.callArgWith(2, null, null, 'err3');

    chai.assert(exec.called);
    chai.expect(exec.firstCall.args[0]).to.contain('rsync');
    chai.expect(exec.firstCall.args[0]).to.not.contain('--include');
  });
});

