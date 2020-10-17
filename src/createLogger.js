/**
 * Kotatsu Logger
 * ===============
 *
 * Building kotatsu's logger.
 */
var levels = require('./levels.js'),
    pkg = require('../package.json'),
    chalk = require('chalk');

var COLORS = {
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'blue',
  verbose: 'cyan',
  debug: 'magenta'
};

module.exports = function createLogger(quiet) {
  var logger = {
    log: function(level, msg) {
      if (quiet)
        return;

      var header = chalk[COLORS[level]]('[kotatsu]');

      console.log(header, msg);
    }
  };

  for (var level in levels)
    logger[level] = logger.log.bind(logger, level);

  logger.announce = function() {
    logger.info('(v' + pkg.version + ')');
  };

  return logger;
};
