import 'ts-helpers';
import ConfigManager from '../src/config';
import * as path from 'path';
import * as chai from 'chai';
import * as sinon from 'sinon';

describe('Config', function () {

  it('should construct the config without options', sinon.test(function () {
    const configMgr = new ConfigManager();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));

  it('should throw error on not getting config file', sinon.test(function () {
    const configMgr = new ConfigManager({
      confFile: 'non-existent.js',
    });

    configMgr.getConfig();
  }));

  it('should throw generic error', sinon.test(function () {
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

  it('should throw error on not getting config file', sinon.test(function (done) {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '/example-watchman-processor.config.js.tmp'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.createConfig().then(done);
  }));

  it('should initialize the example config file', sinon.test(function () {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.getConfig();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));

  it('second getConfig calls will get a cached version', sinon.test(function () {
    const configMgr = new ConfigManager({
      confFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
      exampleConfFile: path.resolve(__dirname + '../../../example/watchman-processor.config.js'),
    });

    configMgr.getConfig();
    configMgr.getConfig();

    chai.assert.isObject(configMgr, 'configMgr is an object');
  }));
});
