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
  opts.solvedOutput = solveOutput(opts);

  var logger = createLogger(opts.quiet);
  logger.announce();

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

  var hashes = {},
      firstTime = true;

  compiler.hooks.afterCompile.tap('kotatsu', function(compilation) {

    var modified = [],
        newHashes = {};

    compilation.modules.forEach(function(m) {
      if (
        typeof hashes[m.id] === 'undefined' ||
        hashes[m.id] !== m.hash
      )
        modified.push(m);

      newHashes[m.id] = m.hash;
    });

    hashes = newHashes;

    if (firstTime) {
      firstTime = false;
      return;
    }

    logger.info('Updated modules:');
    modified.forEach(function(m) {
      logger.info('  ' + m.id);
    });
  });

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

  if (!opts.progress)
    logger.info('Compiling...');

  // Creating the server
  var app = createServer(compiler, opts),
      server = app.listen(opts.port);

  return server;
};
