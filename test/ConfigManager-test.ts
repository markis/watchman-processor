import { assert } from 'chai';
import { unlink as deleteFile } from 'fs';
import { resolve } from 'path';
import { stub } from 'sinon';
import { ConfigManagerImpl as ConfigManager } from '../src/ConfigManager';

describe('Config', () => {
  function noopWrite(str: string) {
    // next line is just here to escape the no unused parameter option
    str = str + '';
  }
  noopWrite('');

  it('should construct the config without options', () => {
    const configMgr = new ConfigManager();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should throw error on not getting config file', (done) => {
    const requireStub = stub();
    requireStub.throws();
    const configMgr = new ConfigManager(undefined, requireStub as any, noopWrite);

    configMgr.getConfig();

    done();
  });

  it('should handle dealing with non existant files', (done) => {
    const configMgr = new ConfigManager({ confFile: 'non-existant.js' });

    configMgr.getConfig();

    done();
  });

  it('should throw error on not getting config file', (done) => {
    const tempFile = resolve(__dirname, 'example/watchman-processor.config.js.tmp');

    const configMgr = new ConfigManager({
      confFile: tempFile,
      exampleConfFile: resolve(__dirname, 'example/watchman-processor.config.js'),
    });

    configMgr.createConfig().then(() => {
      deleteFile(tempFile, done);
    });
  });

  it('should initialize the example config file', () => {
    const configMgr = new ConfigManager({
      confFile: resolve(__dirname, 'example/watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname, 'example/watchman-processor.config.js'),
    });

    configMgr.getConfig();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('second getConfig calls will get a cached version', () => {
    const configMgr = new ConfigManager({
      confFile: resolve(__dirname, 'example/watchman-processor.config.js'),
      exampleConfFile: resolve(__dirname, 'example/watchman-processor.config.js'),
    });

    configMgr.getConfig();
    configMgr.getConfig();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should construct on a windows machine', () => {
    Object.defineProperty(process, 'platform', { value: 'win32' });
    const configMgr = new ConfigManager();

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should construct on a non-windows machine', () => {
    Object.defineProperty(process, 'platform', { value: 'fakeOS' });
    const configMgr = new ConfigManager();

    assert.isObject(configMgr, 'configMgr is an object');
  });
});
