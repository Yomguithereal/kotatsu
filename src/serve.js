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
    open = require('open'),
    path = require('path'),
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
      logger.info('Bundle rebuilding...');
    }
  });

  compiler.hooks.watchRun.tap('kotatsu', function(compilation) {
    if (
      !running ||
      !compilation.modifiedFiles ||
      !compilation.modifiedFiles.size
    )
      return;

    var modifiedFiles = Array.from(compilation.modifiedFiles)
      .filter(function(f) {
        return !!path.extname(f);
      });

    if (!modifiedFiles.length)
      return;

    console.log('');
    logger.info('Modified files:');

    modifiedFiles.forEach(function(f) {
      f = path.relative(process.cwd(), f);
      logger.info('  ./' + f);
    });
  });

  compiler.hooks.done.tap('kotatsu', function(stats) {
    stats = stats.toJson();
    logger.info('Built in ' + pretty(stats.time) + '.');

    if (!running) {
      logger.success('Done!');
      logger.info('Serving your app on http://localhost:' + opts.port);
      running = true;

      if (opts.open) {
        logger.info('Opening app in your web browser...');
        open('http://localhost:' + opts.port);
      }
    }

    // Errors & warnings?
    // var errors = stats.errors || [],
    //     warnings = stats.warnings || [];

    // if (errors.length) {
    //   errors.forEach(function(error) {
    //     logger.error(error);
    //   });
    // }

    // if (warnings.length)
    //   warnings.forEach(function(warning) {
    //     logger.warn(warning);
    //   });
  });

  if (!opts.progress)
    logger.info('Compiling...');

  // Creating the server
  var app = createServer(compiler, opts),
      server = app.listen(opts.port);

  return server;
};
