/**
 * Kotatsu Library
 * ================
 *
 * The main function responsible of the table's heating.
 */
var createCompiler = require('./src/createCompiler.js'),
    logger = require('./src/logger.js'),
    pkg = require('./package.json'),
    chalk = require('chalk'),
    fork =  require('child_process').fork,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

/**
 * Constants.
 */
var DEFAULTS = {
  cwd: process.cwd(),
  config: {},
  index: null,
  mountNode: 'app',
  progress: true,
  output: '.kotatsu',
  side: 'back-end',
  sourcemaps: false,
};

/**
 * Helpers.
 */
function message(data) {
  return _.extend({__hmrUpdate: true}, data);
}

function defaultsPolicy(value, other) {
  return value === undefined ? other : value;
}

/**
 * Main.
 */
module.exports = function(opts) {
  opts = _.extend({}, DEFAULTS, opts, defaultsPolicy);

  // Ensuring we do have an entry
  if (!opts.entry)
    throw Error('kotatsu: no entry provided.');

  // Creating base path
  var output = path.resolve(opts.cwd, opts.output);

  // State
  var running = false,
      child;

  // Creating the webpack compiler
  var compiler = createCompiler(opts);

  // Creating a cleanup function
  var cleanup = function() {
    rmrf.sync(output);
  };

  // Hooking into the compiler
  compiler.plugin('compile', function() {
    if (running)
      logger.info('Bundle rebuilding...');
  });

  // Announcing
  logger.info(chalk.yellow('Kotatsu') + '(v' + pkg.version + ')', {plain: true});

  // Starting to watch
  var watcher = compiler.watch(100, function(err, stats) {
    if (err) throw err;

    // Compiling stats to JSON
    stats = stats.toJson();

    // Errors?
    var errors = stats.errors || [];

    if (errors.length) {
      errors.forEach(function(error) {
        logger.error(error);
      });

      return;
    }

    // Running the script
    if (!running) {

      // Announcing we are done!
      logger.success('Done!');
      logger.info('Starting your script...\n');

      child = fork(path.join(output, 'bundle.js'), [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      // Listening to child's exit
      child.on('exit', function(code) {
        cleanup();

        // Waiting for changes to reload
        logger.error('The script crashed. Waiting for changes to reload...');
        running = false;
        child = null;
      });

      running = true;
    }
    else {

      logger.info('Built in ' + stats.time + 'ms.');

      // Building module map
      var map = {};
      stats.modules.forEach(function(m) {
        map[m.id] = m.name;
      });

      // Notify the child
      child.send(message({
        hash: stats.hash,
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
