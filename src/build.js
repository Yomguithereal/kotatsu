/**
 * Kotatsu Build Command
 * ======================
 *
 * Function building the script as a bundle.
 */
var defaults = require('./defaults.js'),
    createCompiler = require('./createCompiler.js'),
    createLogger = require('./createLogger.js'),
    _ = require('lodash');

module.exports = function build(side, opts) {
  opts = _.merge({}, defaults, opts);

  opts.side = side;
  opts.hot = false;
  opts.build = true;

  var logger = createLogger(opts.quiet);

  logger.announce();

  var compiler = createCompiler(opts);

  compiler.run(function(err, stats) {
    if (err)
      return console.error(err);

    stats = stats.toJson();

    // Errors & warnings?
    var errors = stats.errors || [],
        warnings = stats.warnings || [];

    if (errors.length) {
      errors.forEach(function(error) {
        logger.error(error);
      });

      return;
    }

    if (warnings.length) {
      warnings.forEach(function(warning) {
        logger.warn(warning);
      });
    }

    logger.success('Done!');
  });
};
