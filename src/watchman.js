const Promise = require('promise');

function WatchmanSync(config, watchmanClient, terminal, sync) {
  this.config = config;
  this.client = watchmanClient;
  this.terminal = terminal;
  this.sync = sync;
}

WatchmanSync.prototype.start = function start() {
  this.terminal.start();
  this.client.capabilityCheck({optional: [], required: ['relative_root']}, this.onCapabilityCheck.bind(this));
};

WatchmanSync.prototype.onCapabilityCheck = function onCapabilityCheck(error) {
  const terminal = this.terminal;
  if (error) {
    terminal.error(error);
    return;
  }
  terminal.render();

  var promises = [], subscriptions = Object.keys(this.config.subscriptions);
  for (var i = 0; i < subscriptions.length; i++) {
    var name = subscriptions[i],
      subscription = this.config.subscriptions[name];

    promises.push(this.subscribe(subscription.source, name, null, subscription.watchExpression));
  }
  Promise.all(promises).then(this.terminal.render);

  // subscription is fired regardless of which subscriber fired it
  this.client.on('subscription', this.onSubscription.bind(this));
};

WatchmanSync.prototype.onSubscription = function onSubscription(resp) {
  const terminal = this.terminal;
  const subscription = (resp && resp.subscription) || '';
  const files = resp.files;

  const subConfig = this.config.subscriptions[subscription];
  this.terminal.setState(subConfig, 'running');
  if (subConfig) {
    if (subConfig.type === 'rsync') {
      this.sync.syncFiles(subConfig, subConfig.source, subConfig.destination, files)
        .then(function (output) {
          terminal.debug(output);
          terminal.setState(subConfig, 'good', output);
        })
        .catch(function (err) {
          terminal.debug(err);
          terminal.setState(subConfig, 'error', err);
        });
    }
  }
};

WatchmanSync.prototype.subscribe = function subscribe(folder, name, relativePath, expression) {
  const terminal = this.terminal;
  const client = this.client;
  if (typeof expression === 'undefined') {
    expression = ['allof', ['type', 'f']];
  }
  var sub = {
    expression: expression,
    fields: ['name', 'exists']
  };
  if (relativePath) {
    sub.relative_root = relativePath;
  }

  terminal.debug('starting:' + name + ' expression: ' + JSON.stringify(expression));
  return new Promise(function (resolve, reject) {
    client.command(['subscribe', folder, name, sub],
      function (error) {
        if (error) {
          reject('failed to subscribe: ' + error);
        }
        resolve();
      });
  });
};

module.exports = WatchmanSync;

