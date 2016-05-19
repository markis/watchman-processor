const exec = require('child_process').exec;
const Promise = require('promise');


function Sync(config, terminal) {
  this.config = config;
  this.terminal = terminal;
  this.rsyncCmd = this.config.rsyncCmd || 'rsync';
  this.maxFileLength = this.config.maxFileLength || 100;
}

Sync.prototype.syncFiles = function syncFiles(subConfig, src, dest, files) {
  files = files || [];
  files = files.map(function(file) { return file.name });
  files = files.filter(function(file) {
    return file.indexOf('.sass-cache/') === -1 &&
      file.indexOf('.git/') === -1 &&
      file.indexOf('.idea/') === -1
  });

  // if there are too many files, it might just be better to let rsync figure out what
  // needs to be synced
  if (files.length > 0 && files.length < this.maxFileLength) {
    return this._syncSpecificFiles(subConfig, src, dest, files);
  } else {
    return this._syncAllFiles(subConfig, src, dest);
  }
};

Sync.prototype._syncAllFiles = function _syncAllFiles(subConfig, src, dest) {
  const terminal = this.terminal;
  const rsyncCmd = this.rsyncCmd;
  const excludes = " --exclude '.idea' --exclude '.git' --exclude '.sass-cache'";

  return new Promise(function(resolve, reject) {
    const cmd = [rsyncCmd, '-avz --stats --delete', src, dest, excludes].join(' ');
    terminal.debug(cmd);
    exec(cmd, null, getExecCallback(resolve, reject));
  });
};

Sync.prototype._syncSpecificFiles = function _syncSpecificFiles(subConfig, src, dest, files) {
  const terminal = this.terminal;
  const rsyncCmd = this.rsyncCmd;
  const excludes = "--exclude '*'";

  files =  getUniqueFileFolders(files).concat(files);

  const includes = " --include '" + files.join("' --include '") + "'";

  return new Promise(function(resolve, reject) {
    const cmd = [rsyncCmd, '-avz --stats --delete', includes, excludes, src, dest].join(' ');
    terminal.debug(cmd);
    exec(cmd, null, getExecCallback(resolve, reject));
  });
};

function getUniqueFileFolders(files) {
  const folders = [];
  const length = files.length;
  for (var i = 0, folderParts, folderPartsSum, file; i < length; i++) {
    file = files[i];
    folderParts = file.split('/');
    folderPartsSum = '';
    for (var j = 0; j < folderParts.length - 1; j++) {
      if (folderPartsSum.length > 0) {
        folderPartsSum += '/';
      }
      folderPartsSum += folderParts[j];
      folders.push(folderPartsSum);
    }
  }
  return unique(folders);
}

function unique(a) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

function getExecCallback(resolve, reject) {
  return function(err, stdOut, stdErr) {
    if (err || stdErr) {
      reject(err || stdErr);
    } else {
      resolve(stdOut);
    }
  };
}

module.exports = Sync;