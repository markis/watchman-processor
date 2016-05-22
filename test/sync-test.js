var chai = require('chai');
var mocha = require('mocha');
var sinon = require('sinon');
var proc = require('child_process');
var Sync = require('../src/sync');
var Terminal = require('../src/terminal');

var describe = mocha.describe,
  it = mocha.it,
  exec;

chai.should();
exec = sinon.stub();
sinon.stub(Terminal.prototype, 'debug', function() {});
var config = {
  subscriptions: {
    example1: {
      type: 'rsync',
      source: 'example1',
      destination: 'user@server:/tmp/example1/'
    }
  }
};


describe('Sync', function () {
  
  it('Expect sync to rsync specific files', function () {
    var shortList = [
      {name: 'example1/js/1.js'},
      {name: 'example1/js/2.js'}
    ];
    
    var sync = new Sync(config, new Terminal(), exec);
    var example1 = config.subscriptions.example1;
    sync.syncFiles(example1, example1.source, example1.destination, shortList);

    exec.callArg(2);
    exec.should.be.called;
  });

  it('Expect sync to rsync all files', function () {
    var longList = new Array(1000);
    for (var i = 0, length = longList.length; i < length; i++) {
      longList[i] = { name: 'example1/' + i + '.js' };
    }

    var sync = new Sync(config, new Terminal(), proc.exec);
    var example1 = config.subscriptions.example1;
    sync.syncFiles(example1, example1.source, example1.destination, longList);

    exec.callArg(2);
    exec.should.be.called;
  });

  it('Expect sync to rsync all files when no files are sent', function () {
    var sync = new Sync(config, new Terminal(), proc.exec);
    var example1 = config.subscriptions.example1;
    sync.syncFiles(example1, example1.source, example1.destination);

    exec.callArgWith(2, null, null, 'err3');
    exec.should.be.called;
  });

});