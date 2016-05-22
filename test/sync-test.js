var chai = require('chai');
var mocha = require('mocha');
var sinon = require('sinon');

var Sync = require('../src/sync');

var describe = mocha.describe,
  it = mocha.it;

chai.should();
var mockTerminal = {
  debug: sinon.stub()
};
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
  
  it('Expect sync to construct with no parameters', function() {
    //Setup and Execute
    var sync = new Sync();
  });
  
  it('Expect sync to rsync specific files', function () {

    //Setup
    var shortList = [
      {name: 'example1/js/1.js'},
      {name: 'example1/js/2.js'}
    ];
    var exec = sinon.stub();
    var sync = new Sync(config, mockTerminal, exec);
    var example1 = config.subscriptions.example1;

    //Execute
    sync.syncFiles(example1, example1.source, example1.destination, shortList);
    exec.callArg(2);

    //Measure
    exec.should.be.called;

  });

  it('Expect sync to rsync all files when too many files are sent', function () {

    //Setup
    var longList = new Array(1000);
    for (var i = 0, length = longList.length; i < length; i++) {
      longList[i] = { name: 'example1/' + i + '.js' };
    }
    var exec = sinon.stub();
    var sync = new Sync(config, mockTerminal, exec);
    var example1 = config.subscriptions.example1;

    //Execute
    sync.syncFiles(example1, example1.source, example1.destination, longList);
    exec.callArg(2);

    //Measure
    exec.should.be.called;

  });

  it('Expect sync to rsync all files when no files are sent', function () {

    //Setup
    var exec = sinon.stub();
    var sync = new Sync(config, mockTerminal, exec);
    var example1 = config.subscriptions.example1;

    //Execute
    sync.syncFiles(example1, example1.source, example1.destination);
    exec.callArgWith(2, null, null, 'err3');

    //Measure
    exec.should.be.called;

  });

});