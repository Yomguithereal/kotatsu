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
  opts.hot = command === 'start';
  opts.solvedOutput = solveOutput(opts.output, opts.cwd);

  var logger = createLogger(opts.quiet);

  // State
  var running = false,
      child;

  // Creating the webpack compiler
  var compiler = createCompiler(opts);

  // Creating a cleanup function
  var dirty = true;
  var cleanup = function() {
    if (dirty) {
      rmrf.sync(opts.solvedOutput.path);
      dirty = false;
    }
  };

  // Hooking into the compiler
  compiler.plugin('compile', function() {
    if (running) {
      console.log('');
      logger.info('Bundle rebuilding...');

      if (command === 'monitor') {
        child.kill();
        child = null;
        running = false;
      }
    }
  });

  // Announcing
  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

  // Forging the action
  var run = function(callback) {
    if (command === 'run')
      return compiler.run(callback);
    return compiler.watch({aggregateTimeout: 200}, callback);
  };

  // Starting to watch
  var handle = run(function(err, stats) {
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

      if (command === 'start')
        logger.info('Starting your script...');
      else
        logger.info('Running your script...');

      var scriptPath = path.join(opts.solvedOutput.path, opts.solvedOutput.filename);

      child = fork(scriptPath, opts.args || [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      // Listening to child's log
      child.on('message', function(log) {
        logger.log(log.level, log.message);
      });

      // Listening to child's exit
      child.on('exit', function(code) {

        // If we just ran the script, we stop right here
        if (command === 'run')
          process.exit(0);

        // Waiting for changes to reload
        if (code)
          logger.error('The script crashed. Waiting for changes to reload...');
        else
          logger.info('The script ended. Waiting for changes to reload...');

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
      if (opts.hot)
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

  return handle;
};
