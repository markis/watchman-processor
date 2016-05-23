/// <reference path="../lib/_global.d.ts" />

import fs = require('fs');
const HOME_FOLDER = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
const CONF_FILE = HOME_FOLDER + '/.watchman-processor.config.js';
const EXAMPLE_CONF_FILE = process.cwd() + '/example/watchman-processor.config.js';

if (process.argv[2] === 'init') {
  var reader = fs.createReadStream(EXAMPLE_CONF_FILE);
  reader.on('error', function (err: Error) {
    console.error(err);
  });
  var writer = fs.createWriteStream(CONF_FILE);
  writer.on('error', function (err: Error) {
    console.error(err);
  });
  writer.on('close', function () {
    console.log('Done.  "' + CONF_FILE + '" created.');
  });
  reader.pipe(writer);
  module.exports = false;
}


try {
  module.exports = require(CONF_FILE);
} catch (e) {
  if (e.code === 'MODULE_NOT_FOUND') {
    console.error('"' + HOME_FOLDER + '/.watchman-processor.config.js" does not exist. \n\n' +
      'Run "watchman-processor init" to create an example configuration file.');
    module.exports = false;
  } else {
    throw e;
  }
}
