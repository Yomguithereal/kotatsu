/*
 * Kotatsu Hot Logger
 * ===================
 *
 * Communication between the child & parent process.
 */
var levels = Object.keys(require('../src/levels.js'));

function log(level) {
  return function(message) {
    return process.send({
      level: level,
      message: message
    });
  };
}

var functions = {};

levels.forEach(function(level) {
  functions[level] = log(level);
});

module.exports = functions;
