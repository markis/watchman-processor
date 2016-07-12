import 'ts-helpers';
import ConfigManager from '../src/config';
import * as path from 'path';
import * as chai from 'chai';
import * as sinon from 'sinon';

describe('Config', function () {

  it('Config can construct without options', sinon.test(function () {
    this.stub(console, 'log');
    this.stub(console, 'error');
    
    const configMgr = new ConfigManager();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));

  it('Throw error on not getting config file', sinon.test(function () {
    this.stub(console, 'log');
    this.stub(console, 'error');
    
    const configMgr = new ConfigManager({
      confFile: 'non-existent.js'
    });
    
    configMgr.getConfig();
  }));

  it('Throw error on not getting config file', sinon.test(function () {
    this.stub(console, 'log');
    this.stub(console, 'error');
    
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '/example-watchman-processor.config.js.tmp'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js')
    });

    configMgr.createConfig();
  }));
});

