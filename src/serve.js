/**
 * Kotatsu Serve Command
 * ======================
 *
 * Function serving a application using a very basic express server and sending
 * HMR updates to the client.
 */
var defaults = require('./defaults.js'),
    solveOutput = require('./solveOutput.js'),
    createServer = require('./createServer.js'),
    createCompiler = require('./createCompiler.js'),
    createLogger = require('./createLogger.js'),
    pretty = require('pretty-ms'),
    _ = require('lodash');

/**
 * Serve function.
 */
module.exports = function serve(opts) {
  opts = _.merge({}, defaults, opts);

  opts.side = 'front';
  opts.solvedOutput = solveOutput(opts.output, opts.cwd);

  var logger = createLogger(opts.quiet);

  // State
  var running = false;

  // Creating the compiler
  var compiler = createCompiler(opts);

  // Hooking into the compiler
  compiler.hooks.compile.tap('kotatsu', function() {
    if (running) {
      console.log('');
      logger.info('Bundle rebuilding...');
    }
  });

  // NOTE: this does not work anymore
  // compiler.plugin('bundle-update', function(newModules, updatedModules, removedModules, stats) {
  //   updatedModules = Object.keys(updatedModules);

  //   stats = stats.toJson();

  //   // Delaying to next tick to avoid progress bar collision
  //   process.nextTick(function() {

  //     // Building module map
  //     var map = {};
  //     stats.modules.forEach(function(m) {
  //       map[m.id] = m.name;
  //     });

  //     if (updatedModules.length) {
  //       logger.info('Updated modules:');
  //       updatedModules.forEach(function(m) {
  //         if (map[m])
  //           logger.info('  - ' + map[m]);
  //       });
  //     }
  //   });
  // });

  compiler.hooks.done.tap('kotatsu', function(stats) {
    stats = stats.toJson();
    logger.info('Built in ' + pretty(stats.time) + '.');

    if (!running) {
      logger.success('Done!');
      logger.info('Serving your app on port ' + opts.port + '...');
      running = true;
    }

    // Errors & warnings?
    var errors = stats.errors || [],
        warnings = stats.warnings || [];

    if (errors.length) {
      errors.forEach(function(error) {
        logger.error(error);
      });
    }

    if (warnings.length)
      warnings.forEach(function(warning) {
        logger.warn(warning);
      });
  });

  // Announcing
  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

  // Creating the server
  var app = createServer(compiler, opts),
      server = app.listen(opts.port);

  return server;
};
