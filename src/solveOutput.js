/**
 * Kotatsu Output Solver
 * ======================
 *
 * Simple output solver.
 */
var path = require('path');

module.exports = function(output) {
  var ext = path.extname(output),
      directory = output,
      filename = 'bundle.js';

  if (ext) {
    filename = path.basename(output);
    directory = path.dirname(output);
  }

  return {
    path: directory,
    filename: filename
  };
};
