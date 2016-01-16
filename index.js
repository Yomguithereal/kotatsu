/**
 * Kotatsu Library
 * ================
 *
 * The main function responsible of the table's heating.
 */
var createCompiler = require('./src/createCompiler.js'),
    createServer = require('./src/createServer.js'),
    createLogger = require('./src/createLogger.js'),
    pretty = require('pretty-ms'),
    fork = require('child_process').fork,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

/**
 * Constants.
 */
var DEFAULTS = {
  args: [],
  babel: false,
  cwd: process.cwd(),
  config: null,
  devtool: null,
  es2015: false,
  index: null,
  jsx: false,
  mountNode: 'app',
  output: '.kotatsu',
  port: 3000,
  pragma: null,
  presets: [],
  progress: false,
  public: null,
  quiet: false,
  sourceMaps: false,
};

/**
 * Helpers.
 */
function message(data) {
  return _.extend({__hmrUpdate: true}, data);
}

/**
 * Start a long-living node.js process:
 */
function start(opts) {
  opts = _.merge({}, DEFAULTS, opts);

  opts.command = 'start';

  var logger = createLogger(opts.quiet);

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
      logger.info('Starting your script...');

      child = fork(path.join(output, 'bundle.js'), opts.args || [], {
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
}

/**
 * Serve a client-side app:
 */
function serve(opts) {
  opts = _.merge({}, DEFAULTS, opts);

  opts.command = 'serve';

  var logger = createLogger(opts.quiet);

  // State
  var running = false;

  // Creating the compiler
  var compiler = createCompiler(opts);

  // Hooking into the compiler
  compiler.plugin('compile', function() {
    if (running) {
      console.log('');
      logger.info('Bundle rebuilding...');
    }
  });

  var lastMap = {};
  compiler.plugin('bundle-update', function(newModules, changedModules, removedModules, stats) {
    newModules = Object.keys(newModules);
    changedModules = Object.keys(changedModules);
    removedModules = Object.keys(removedModules);

    stats = stats.toJson();

    // Delaying to next tick to avoid progress bar collision
    process.nextTick(function() {

      // Building module map
      var map = {};
      stats.modules.forEach(function(m) {
        map[m.id] = m.name;
      });

      if (newModules.length) {
        logger.info('Added modules:');
        newModules.forEach(function(m) {
          logger.info('  - ' + map[m] || m);
        });
      }

      if (changedModules.length) {
        logger.info('Updated modules:');
        changedModules.forEach(function(m) {
          logger.info('  - ' + map[m] || m);
        });
      }

      if (removedModules.length) {
        logger.info('Removed modules:');
        removedModules.forEach(function(m) {
          logger.info('  - ' + lastMap[m] || m);
        });
      }

      lastMap = map;
    });
  });

  compiler.plugin('done', function(stats) {
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
}

/**
 * Exporting
 */
module.exports = {
  serve: serve,
  start: start
};
