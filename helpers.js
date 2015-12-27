/**
 * Kotatsu Helpers
 * ================
 *
 * Miscellaneous helper functions.
 */
var chalk = require('chalk');

/**
 * Logging.
 */
var LOG_COLORS = {
  info: 'blue',
  success: 'green',
  warning: 'yellow',
  error: 'red'
};

function log(status, lines) {
  lines = [].concat(lines || []).map(function(line) {
    return '[' + chalk[LOG_COLORS[status]]('kotatsu') + '] ' + line;
  });

  console.log(lines.join('\n'));
}

module.exports = {
  log: log
};
