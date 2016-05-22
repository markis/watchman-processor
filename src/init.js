var fs = require('fs');
var HOME_FOLDER = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
var EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';

if (process.argv[2] === 'init') {
  var reader = fs.createReadStream(EXAMPLE_CONF_FILE);
  reader.on('error', function (err) {
    console.error(err);
  });
  var writer = fs.createWriteStream(CONF_FILE);
  writer.on('error', function (err) {
    console.error(err);
  });
  writer.on('close', function () {
    console.log('Done.  "' + CONF_FILE + '" created.');
  });
  reader.pipe(writer);
  module.exports = false;
}

var config;
try {
  config = require(CONF_FILE);
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.error('"' + HOME_FOLDER + '/.watchman-processor.config.js" does not exist. \n\n' +
      'Run "watchman-processor init" to create an example configuration file.');
    module.exports = false;
  }
  throw e;
}

module.exports = config;