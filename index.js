/**
 * Kotatsu Library
 * ================
 *
 * The main function responsible of the table's heating.
 */
var createCompiler = require('./src/createCompiler.js'),
    createServer = require('./src/createServer.js'),
    createLogger = require('./src/createLogger.js'),
    fork =  require('child_process').fork,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

/**
 * Constants.
 */
var DEFAULTS = {
  cwd: process.cwd(),
  config: null,
  devtool: null,
  es2015: false,
  index: null,
  jsx: false,
  mountNode: 'app',
  port: 3000,
  pragma: null,
  progress: false,
  quiet: false,
  output: '.kotatsu',
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
    if (running)
      logger.info('Bundle rebuilding...');
  });

  // Announcing
  logger.announce();

  if (!opts.progress)
    logger.info('Compiling...');

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
      logger.info('Starting your script...');

      child = fork(path.join(output, 'bundle.js'), [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      // Listening to child's log
      child.on('message', function(log) {
        logger.log(log.level, log.message);
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
    if (running)
      logger.info('Bundle rebuilding...');
  });

  compiler.plugin('done', function(stats) {
    stats = stats.toJson();
    logger.info('Built in ' + stats.time + 'ms.');
  });

  // Announcing
  logger.announce();
  logger.info('Serving your app on port ' + opts.port + '...');

  if (!opts.progress)
    logger.info('Compiling...');

  // Creating the server
  var app = createServer(compiler, opts),
      server = app.listen(opts.port);

  running = true;
  return server;
}

/**
 * Exporting
 */
module.exports = {
  serve: serve,
  start: start
};
