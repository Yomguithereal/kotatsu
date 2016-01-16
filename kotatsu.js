/**
 * Kotatsu Library
 * ================
 *
 * Exposing the API.
 */
var start = require('./src/start.js');

module.exports = {
  run: start.bind(null, 'run'),
  serve: require('./src/serve.js'),
  start: start.bind(null, 'start')
};
