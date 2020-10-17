/**
 * Kotatsu Build Command
 * ======================
 *
 * Function building the script as a bundle.
 */
var defaults = require('./defaults.js'),
    pretty = require('pretty-ms'),
    solveOutput = require('./solveOutput.js'),
    createCompiler = require('./createCompiler.js'),
    createLogger = require('./createLogger.js'),
    _ = require('lodash');

module.exports = function build(side, opts, callback) {
  opts = _.merge({}, defaults, opts);
  callback = callback || Function.prototype;

  opts.side = side;
  opts.hot = false;
  opts.build = true;
  opts.solvedOutput = solveOutput(opts);

  var logger = createLogger(opts.quiet);
  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

  var compiler = createCompiler(opts);

  compiler.run(function(err, stats) {
    if (err)
      return callback(err);

    stats = stats.toJson();

    // Errors & warnings?
    var errors = stats.errors || [],
        warnings = stats.warnings || [];

    if (errors.length) {
      errors.forEach(function(error) {
        logger.error(error);
      });

      return callback(err);
    }

    if (warnings.length) {
      warnings.forEach(function(warning) {
        logger.warn(warning);
      });
    }

    logger.info('Built in ' + pretty(stats.time) + '.');
    logger.success('Done!');
  });
};
