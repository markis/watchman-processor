import 'ts-helpers';

import * as chai from 'chai';
import * as path from 'path';
import * as sinon from 'sinon';

import ConfigManager from '../src/config';

describe('Config', () => {

  it('should construct the config without options', sinon.test(() => {
    const configMgr = new ConfigManager();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));

  it('should throw error on not getting config file', sinon.test(() => {
    const configMgr = new ConfigManager({
      confFile: 'non-existent.js',
    });

    configMgr.getConfig();
  }));

  it('should throw generic error', sinon.test(() => {
    const customRequire: NodeRequireFunction = (id: string) => {
      throw 'error';
    };

    const configMgr = new ConfigManager({}, customRequire);

    try {
      configMgr.getConfig();
    } catch (e) {
      // do nothing
    }
  }));

  it('should throw error on not getting config file', sinon.test((done) => {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '/example-watchman-processor.config.js.tmp'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.createConfig().then(done);
  }));

  it('should initialize the example config file', sinon.test(() => {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.getConfig();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));

  it('second getConfig calls will get a cached version', sinon.test(() => {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.getConfig();
    configMgr.getConfig();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));
});
