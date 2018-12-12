/**
 * Kotatsu Output Solver
 * ======================
 *
 * Simple output solver.
 */
var path = require('path');

module.exports = function solveOutput(opts) {
  var output = opts.output,
      cwd = opts.cwd,
      side = opts.side;

  if (!output)
    return {
      path: path.join(cwd, side === 'back' ? '.kotatsu' : 'build'),
      filename: 'bundle.js'
    };

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
