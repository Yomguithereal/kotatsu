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

  transports.push(new winston.transports.Console({
    format: winston.format.combine(winston.format.printf(formatter)),
    silent: quiet
  }));

  var logger = winston.createLogger({
    levels: levels,
    transports: transports
  });

  logger.announce = function() {
    this.info('(v' + pkg.version + ')');
  };

  return logger;
};
