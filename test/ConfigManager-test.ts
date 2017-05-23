import { assert } from 'chai';
import { existsSync, unlink as deleteFile } from 'fs';
import { resolve } from 'path';
import { stub } from 'sinon';
import { ConfigManager } from '../interfaces';
import { Bindings } from '../src/ioc.bindings';
import { container, setArgs } from './ioc-test';

describe('ConfigManager', () => {
  beforeEach(() => {
    container.snapshot();
  });

  afterEach(() => {
    container.restore();
  });

  it('should construct the example config', () => {
    const configMgr = container.get(Bindings.ConfigManager);

    assert.isObject(configMgr, 'configMgr is an object');
  });

  it('should return an error on not getting config file', () => {
    container.rebind(Bindings.Require).toConstantValue(stub().throws());

    const configMgr = container.get<ConfigManager>(Bindings.ConfigManager);

    assert.instanceOf(configMgr.getConfig(), Error);
  });

  it('should return an error when given an non-existant files', () => {
    setArgs('-c', 'non-existant.js');

    const configMgr = container.get<ConfigManager>(Bindings.ConfigManager);

    assert.instanceOf(configMgr.getConfig(), Error);
  });

  it('should create a configuration file', (done) => {
    const tempFile = resolve(__dirname, 'example/watchman-processor.config.js.tmp');
    const configMgr = container.get<ConfigManager>(Bindings.ConfigManager);

    configMgr.createConfig(tempFile)
      .then(() => {
        assert.isTrue(existsSync(tempFile));
        deleteFile(tempFile, () => {
          done();
        });
      });
  });

  it('should initialize the example config file', () => {
    setArgs('-c', 'example/watchman-processor.config.js');
    const configMgr = container.get<ConfigManager>(Bindings.ConfigManager);
    const config = configMgr.getConfig();

    assert.isObject(config);
  });

  it('should cache config between getConfig calls', () => {
    setArgs('-c', 'example/watchman-processor.config.js');
    const configMgr = container.get<ConfigManager>(Bindings.ConfigManager);

    const config = configMgr.getConfig();
    const config2 = configMgr.getConfig();

    assert.strictEqual(config, config2);
  });
});
