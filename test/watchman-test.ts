import 'ts-helpers';
import { Config } from '../src/config';
import Terminal from '../src/terminal';
import Sync from '../src/sync';
import Watchman from '../src/watchman';
import * as watchmanClient from 'fb-watchman';
import * as chai from 'chai';
import * as sinon from 'sinon';

const mockTerminal = sinon.mock(Terminal);
const mockSync = sinon.mock(Sync);
const mockWatchmanClient = sinon.mock(watchmanClient);
const config: Config = {
  subscriptions: {
    example1: {
      destination: 'user@server:/tmp/example1/',
      source: 'example1',
      type: 'rsync'
    }
  }
};

describe('Watchman', function () {

  it('Expect watchman to construct', function () {
    const terminal = new mockTerminal.object();
    const sync = new mockSync.object();
    const watchmanClient = mockWatchmanClient.object;
    const watchman = new Watchman(config, watchmanClient, sync, terminal);

    chai.assert.isObject(watchman, 'watchman is an object');
  });
    
});

