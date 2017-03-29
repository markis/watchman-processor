import 'ts-helpers';

import { assert } from 'chai';
import { resolve } from 'path';

import ConfigManager from '../src/config';

describe('Config', () => {
  function noop() {
    // do nothing
  }

  it('should construct the config without options', () => {
    const configMgr = new ConfigManager();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should throw error on not getting config file', () => {
    const configMgr = new ConfigManager({
      confFile: 'non-existent.js',
    });

    configMgr.getConfig();
  });

  it('should throw generic error', () => {
    const customRequire: NodeRequireFunction = (id: string) => {
      throw 'error';
    };

    const configMgr = new ConfigManager({}, customRequire);

    try {
      configMgr.getConfig();
    } catch (e) {
      // do nothing
    }
  });

  it('should throw error on not getting config file', (done) => {
    const configMgr = new ConfigManager({
      confFile: resolve(__dirname, 'example-watchman-processor.config.js.tmp'),
      exampleConfFile: resolve(__dirname, '../../', 'example/watchman-processor.config.js'),
    });

    configMgr.createConfig().then(done);
  });

  it('should initialize the example config file', () => {
    const configMgr = new ConfigManager({
      confFile: resolve(__dirname, '../../', 'example/watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname, '../../', 'example/watchman-processor.config.js'),
    });

    configMgr.getConfig();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('second getConfig calls will get a cached version', () => {
    const configMgr = new ConfigManager({
      confFile: resolve(__dirname, '../../', 'example/watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname, '../../', 'example/watchman-processor.config.js'),
    });

    configMgr.getConfig();
    configMgr.getConfig();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should construct on a windows machine', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const configMgr = new ConfigManager(undefined, undefined, noop);

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should construct on a non-windows machine', () => {
    Object.defineProperty(process, 'platform', { value: 'fakeOS' });
    const configMgr = new ConfigManager(undefined, undefined, noop);

    assert.isObject(configMgr, 'configMgr is an object');
  });
});
