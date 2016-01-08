/**
 * Kotatsu Log Formatter
 * ======================
 *
 * The formatter function passed to the winston logger.
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

module.exports = function formatter(options) {
  if (options.meta.plain)
    return options.message;

  return [
    chalk[COLORS[options.level]]('[kotatsu] '),
    options.message
  ].join('');
};
