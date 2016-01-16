/**
 * Kotatsu Start Command
 * ======================
 *
 * Function starting a long-running node.js script, watching for its
 * changes and applying HMR updates to it.
 */
var defaults = require('./defaults.js'),
    createCompiler = require('./createCompiler.js'),
    createLogger = require('./createLogger.js'),
    solveOutput = require('./solveOutput.js'),
    pretty = require('pretty-ms'),
    path = require('path'),
    fork = require('child_process').fork,
    rmrf = require('rimraf'),
    _ = require('lodash');

/**
 * Helpers.
 */
function message(data) {
  return _.extend({__hmrUpdate: true}, data);
}

/**
 * Start function.
 */
module.exports = function start(command, opts) {
  opts = _.merge({}, defaults, opts);

  opts.side = 'back';
  opts.hot = command !== 'run';
  opts.output = solveOutput(opts.output);

  var logger = createLogger(opts.quiet);

  // Ensuring we do have an entry
  if (!opts.entry)
    throw Error('kotatsu: no entry provided.');

  // State
  var running = false,
      child;

  // Creating the webpack compiler
  var compiler = createCompiler(opts);

  // Creating a cleanup function
  var cleanup = function() {
    rmrf.sync(opts.output.directory);
  };

  // Hooking into the compiler
  compiler.plugin('compile', function() {
    if (running) {
      console.log('');
      logger.info('Bundle rebuilding...');
    }
  });

  // Announcing
  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

  // Starting to watch
  var watcher = compiler.watch({aggregateTimeout: 200}, function(err, stats) {
    if (err) throw err;

    // Compiling stats to JSON
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

    // Running the script
    if (!running) {

      // Announcing we are done!
      logger.success('Done!');

      if (command === 'run')
        logger.info('Running your script...');
      else
        logger.info('Starting your script...');

      var scriptPath = path.join(opts.output.directory, opts.output.filename)

      child = fork(scriptPath, opts.args || [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      // Listening to child's log
      child.on('message', function(log) {
        logger.log(log.level, log.message);
      });

      // Listening to child's exit
      child.on('exit', function() {
        cleanup();

        // If we just ran the script, we stop right here
        if (command === 'run')
          process.exit(0);

        // Waiting for changes to reload
        logger.error('The script crashed. Waiting for changes to reload...');
        running = false;
        child = null;
      });

      running = true;
    }
    else {

      logger.info('Built in ' + pretty(stats.time) + '.');

      // Building module map
      var map = {};
      stats.modules.forEach(function(m) {
        map[m.id] = m.name;
      });

      // Notify the child
      child.send(message({
        hash: stats.hash,
        type: 'update',
        modules: map
      }));
    }
  });

  // Cleaning up on exit
  process.on('SIGINT', function() {
    if (child)
      child.kill();

    cleanup();

    process.exit();
  });

  process.on('exit', function() {
    if (child)
      child.kill();

    cleanup();
  });

  return watcher;
};
