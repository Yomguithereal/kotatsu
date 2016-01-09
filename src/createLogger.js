/**
 * Kotatsu Winston Logger
 * =======================
 *
 * Building kotatsu's Winston logger.
 */
var winston = require('winston'),
    levels = require('./levels.js'),
    formatter = require('./formatter.js'),
    pkg = require('../package.json');

module.exports = function createLogger(quiet) {
  var transports = [];

  if (!quiet)
    transports.push(new winston.transports.Console({
      formatter: formatter
    }));

  var logger = new winston.Logger({
    levels: levels,
    transports: transports
  });

  logger.announce = function() {
    this.info('(v' + pkg.version + ')');
  };

  return logger;
};
