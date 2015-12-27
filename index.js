/**
 * Kotatsu Library
 * ================
 *
 * The main function responsible of the table's heating.
 */
var ProgressBar = require('progress'),
    webpack = require('webpack'),
    pkg = require('./package.json'),
    log = require('./helpers.js').log,
    chalk = require('chalk'),
    fork =  require('child_process').fork,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

/**
 * Helpers.
 */
function message(data) {
  return _.extend({__hmrUpdate: true}, data);
}

/**
 * Main.
 */
module.exports = function(opts) {
  opts = _.cloneDeep(opts) || {};

  // Handling defaults
  if (!opts.cwd)
    opts.cwd = process.cwd();

  // Integrity of the options
  if (!opts.entry)
    throw Error('kotatsu: no entry provided.');

  var base = path.resolve(opts.cwd, opts.output || '.kotatsu');

  // Creating the progress bar
  var fmt = 'Compiling - [:bar] :percent ';
  var bar = new ProgressBar(fmt, {
    total: 30,
    width: 30,
    incomplete: ' ',
    complete: '='
  });

  // Variables
  var running = false,
      child;

  // Creating the webpack compiler
  var config = {
    entry: [
      path.join(__dirname, 'hot', 'client.js'),
      opts.entry
    ],
    target: 'node',
    node: {
      console: false,
      global: false,
      process: false,
      Buffer: false,
      __filename: false,
      __dirname: false,
      setImmediate: false
    },
    output: {
      path: base,
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.ProgressPlugin(function(percent, message) {
        if (running)
          return;

        bar.fmt = fmt + message;
        bar.update(percent);
      })
    ],
    module: {

      // NOTE: popular node libraries issues handling
      noParse: /node_modules\/json-schema\/lib\/validate\.js/
    }
  };

  // Sourcemaps?
  if (opts.sourcemaps) {
    config.devtool = 'source-map';
    config.plugins.push(new webpack.BannerPlugin('require(\'source-map-support\').install();', {
      raw: true,
      entryOnly: false
    }))
  }

  var compiler = webpack(_.merge({}, opts.config, config));

  // Creating a cleanup function
  var cleanup = function() {
    rmrf.sync(base);
  };

  // Hooking into the compiler
  compiler.plugin('compile', function() {
    if (running)
      log('info', 'Bundle rebuilding...');
  });

  // Announcing
  console.log(chalk.yellow('Kotatsu ') + '(v' + pkg.version + ')');

  // Starting to watch
  var watcher = compiler.watch(100, function(err, stats) {
    if (err)
      return console.error(err);

    stats = stats.toJson();

    // Running the script
    if (!running) {

      // Announcing we are done!
      console.log(chalk.green('Done!'));
      console.log('Starting your script...\n');

      child = fork(path.join(base, 'bundle.js'), [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      // Listening to child's exit
      child.on('exit', function() {
        cleanup();
        process.exit();
      });

      running = true;
    }
    else {

      log('info', 'Built in ' + stats.time + 'ms.');

      // Building module map
      var map = {};
      stats.modules.forEach(function(m) {
        map[m.id] = m.name
      });

      // Notify the child
      child.send(message({hash: stats.hash, modules: map}));
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
