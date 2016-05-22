var chai = require('chai');
var mocha = require('mocha');
var sinon = require('sinon');
var Terminal = require('../src/terminal');

var describe = mocha.describe,
  it = mocha.it,
  stdErrWrite = stdOutWrite = function() {};

chai.should();
var config = {
  emoji: true,
  subscriptions: {
    example1: {
      type: 'rsync',
      source: 'example1',
      destination: 'user@server:/tmp/example1/'
    }
  }
};
var emoji = {
  emojify: function (msg) {
    return msg;
  }
};

describe('Terminal', function () {
  
  it('Expect terminal to log starting', function () {
    var terminal = new Terminal({}, stdErrWrite, stdOutWrite, null, emoji);
    terminal.start();
  });
  
  it('Expect terminal to log error', function () {
    var terminal = new Terminal({}, stdErrWrite, stdOutWrite, null, emoji);
    terminal.error('err');
  });

  it('Expect terminal to render default state', function () {
    var terminal = new Terminal(config, stdErrWrite, stdOutWrite, null, emoji);
    terminal.setState(config.subscriptions.example1);
    terminal.render();
  });

  it('Expect terminal to render a good state', function () {
    var terminal = new Terminal(config, stdErrWrite, stdOutWrite, null, emoji);
    terminal.setState(config.subscriptions.example1, 'good');
    terminal.render();
  });

  it('Expect terminal to render a running state', function () {
    var terminal = new Terminal(config, stdErrWrite, stdOutWrite, null, emoji);
    terminal.setState(config.subscriptions.example1, 'running');
    terminal.render();
  });

  it('Expect terminal to render an error state', function () {
    var terminal = new Terminal(config, stdErrWrite, stdOutWrite, null, emoji);
    terminal.setState(config.subscriptions.example1, 'error');
    terminal.render();
  });

  it('Expect terminal to render when the debug is enabled', function () {
    var terminal = new Terminal({ debug: true }, stdErrWrite, stdOutWrite );
    terminal.debug('msg');
    terminal.render();
  });

  it('Expect emojify to return a un-emojify message when its turned off', function () {
    var terminal = new Terminal({ emoji: false });
    terminal.emojify('test');
  });
  
});