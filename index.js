/**
 * Kotatsu Library
 * ================
 *
 */
var ProgressBar = require('progress'),
    webpack = require('webpack'),
    pkg = require('./package.json'),
    chalk = require('chalk'),
    fork =  require('child_process').fork,
    rmrf = require('rimraf'),
    path = require('path'),
    _ = require('lodash');

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

  var base = path.join(opts.cwd, '.kotatsu');

  // Creating the progress bar
  var fmt = 'Compiling - [:bar] :percent ';
  var bar = new ProgressBar(fmt, {
    total: 30,
    width: 30,
    incomplete: ' ',
    complete: '='
  });

  // TODO: configurable
  // TODO: file location

  // Variables
  var running = false,
      child;

  // Creating the webpack compiler
  var config = {
    entry: [
      'webpack/hot/signal',
      opts.entry
    ],
    target: 'node',
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

  var compiler = webpack(_.merge({}, config, opts.config));

  // Announcing
  console.log(chalk.yellow('Kotatsu ') + '(v' + pkg.version + ')');

  // Starting to watch
  var watcher = compiler.watch(100, function(err, stats) {
    if (err)
      return console.error(err);

    // Running the script
    if (!running) {

      // Announcing we are done!
      console.log(chalk.green('Done!'));
      console.log('Starting your script...\n');

      child = fork(path.join(base, 'bundle.js'), [], {
        uid: process.getuid(),
        gid: process.getgid()
      });

      running = true;
    }
    else {

      // TODO: replace this by custom handling through messages
      // TODO: need to fork then
      child.kill('SIGUSR2');
    }
  });

  // Cleaning up on exit
  function cleanup(isSignal) {
    if (child)
      child.kill();
    rmrf.sync(base);

    if (isSignal)
      process.exit();
  }

  process.on('exit', cleanup.bind(null, false));
  process.on('SIGINT', cleanup.bind(null, true));

  return watcher;
};
