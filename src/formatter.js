/**
 * Kotatsu Log Formatter
 * ======================
 *
 * The formatter function used by the logger.
 */
var chalk = require('chalk');

var COLORS = {
  error: 'red',
  warn: 'yellow',
  success: 'green',
  info: 'blue',
  verbose: 'cyan',
  debug: 'magenta'
};

module.exports = function formatter(info) {
  return [
    chalk[COLORS[info.level]]('[kotatsu]'),
    ' ',
    info.message
  ].join('');
};
