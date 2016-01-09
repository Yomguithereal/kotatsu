#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 * The CLI tool that will call the lib's function.
 */
var kotatsu = require('./index.js'),
    yargs = require('yargs'),
    path = require('path'),
    pkg = require('./package.json'),
    fs = require('fs');

var COMMANDS = [
  'start',
  'serve',
  'monitor'
];

// Building the CLI
var argv = yargs
  .locale('en')
  .wrap(100)
  .usage('Usage: kotatsu <command> {options} [entry]')
  .demand(2)
  .check(function(argv) {
    var command = argv._[0];

    if (!~COMMANDS.indexOf(command))
      throw Error('Invalid command: ' + command + '.');

    return true;
  })

  // Commands
  .command('start', 'Starts a node.js script.')
  .command('serve', 'Serves a client-side application endpoint.')
  .command('monitor', 'Monitors a terminating node.js script.')

  // Generic options
  .option('c', {
    alias: 'config',
    describe: 'Optional webpack config that will be merged with kotatsu\'s one (useful if you need specific loaders).'
  })
  .option('s', {
    alias: 'source-maps',
    describe: 'Should source maps be computed for easier debugging?',
    type: 'boolean',
    default: false
  })
  .option('d', {
    alias: 'devtool',
    describe: 'Webpack devtool spec to use to compute source maps.',
    type: 'string',
    default: null
  })
  .option('p', {
    alias: 'progress',
    describe: 'Should it display the compilation\'s progress?',
    type: 'boolean',
    default: false
  })

  // Examples
  .example('kotatsu start ./script.js', 'Launching the given script with HMR.')
  .example('kotatsu start -c webpack.config.js ./script.js', 'Using a specific webpack config.')
  .example('kotatsu start --source-maps ./script.js', 'Computing source maps.')

  // Help & Version
  .version(pkg.version)
  .help('h')
  .alias('h', 'help')
  .epilogue('Repository: ' + pkg.repository.url)
  .argv;

var command = argv._[0],
    entry = argv._[1],
    config = {};

// Should we load a config file?
if (argv.config)
  config = require(path.join(process.cwd(), argv.config));

// Ensuring that our entry exists
try {
  var stats = fs.lstatSync(entry);
}
catch (e) {
  console.error('Entry file does not exist:', entry);
  process.exit(1);
}

if (!stats.isFile()) {
  console.error('Entry file does not exist:', entry);
  process.exit(1);
}

var cwd = process.cwd();

var opts = {
  cwd: cwd,
  config: config,
  devtool: argv.d,
  entry: path.resolve(cwd, entry),
  progress: argv.p,
  output: argv.o,
  sourceMaps: argv.s
};

// Creating the watcher
var watcher;

if (command === 'start') {
  watcher = kotatsu.start(opts);
}
else {
  console.error('The "' + command + '" command is not yet supported.');
  process.exit(1);
}
