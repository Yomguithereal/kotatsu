/**
 * Kotatsu Logger
 * ===============
 *
 * Building kotatsu's logger.
 */
var levels = require('./levels.js'),
    formatter = require('./formatter.js'),
    pkg = require('../package.json');

module.exports = function createLogger(quiet) {
  var logger = {
    log: function(level, msg) {
      if (quiet)
        return;

      msg = formatter({level: level, message: msg});
      console.log(msg);
    }
  };

  for (var level in levels)
    logger[level] = logger.log.bind(logger, level);

  logger.announce = function() {
    logger.info('(v' + pkg.version + ')');
  };

  return logger;
};
