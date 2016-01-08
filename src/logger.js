/**
 * Kotatsu Winston Logger
 * =======================
 *
 * Building kotatsu's Winston logger.
 */
var winston = require('winston'),
    levels = require('./levels.js'),
    formatter = require('./formatter.js');

module.exports = new winston.Logger({
  levels: levels,
  transports: [
    new winston.transports.Console({
      formatter: formatter
    })
  ]
});
