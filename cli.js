#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 * The CLI tool that will call the lib's function.
 */
var kotatsu = require('./kotatsu.js'),
    red = require('chalk').red,
    yargs = require('yargs'),
    path = require('path'),
    pkg = require('./package.json'),
    fs = require('fs');

var COMMANDS = [
  'start',
  'serve',
  'monitor',
  'run',
  'build'
];

var EXPECTED_PARTS = 2;

function error(message) {
  throw Error('\n' + red('Error: ' + message));
}

// Building the CLI
var argv = yargs
  .locale('en')
  .wrap(100)
  .usage('Usage: kotatsu <command> {options} [entry]')
  .demand(2)
  .check(function(argv) {
    var command = argv._[0];

    if (!Number.isInteger(argv.port))
      error('Invalid port: ' + argv.port);

    if (!~COMMANDS.indexOf(command))
      error('Invalid command: ' + command);

    if (command === 'build') {
      if (argv._.length < 3)
        error('The "build" command takes 2 arguments: client or server, and the entry.');

      if (!~['client', 'server'].indexOf(argv._[1]))
        error('Do you want to build for client or server? You gave: "' + argv._[1] + '".');
    }

    return true;
  })

  // Commands
  .command('start', 'Starts a node.js script.')
  .command('serve', 'Serves a client-side application.')
  .command('monitor', 'Monitors a terminating node.js script. [not implemented yet]')
  .command('run', 'Run the given node.js script.')
  .command('build', 'Builds your code.')

  // Generic options
  .option('c', {
    alias: 'config',
    describe: 'Optional webpack config that will be merged with kotatsu\'s one (useful if you need specific loaders).'
  })
  .option('d', {
    alias: 'devtool',
    describe: 'Webpack devtool spec to use to compute source maps.',
    type: 'string'
  })
  .option('m', {
    alias: 'mount-node',
    describe: 'Id of the mount node in the generated HMTL index.',
    type: 'string'
  })
  .option('o', {
    alias: 'output',
    describe: 'Output path (either directory or filename).',
    type: 'string'
  })
  .option('p', {
    alias: 'port',
    describe: 'Port that the server should listen to.',
    default: 3000
  })
  .option('s', {
    alias: 'source-maps',
    describe: 'Should source maps be computed for easier debugging?',
    type: 'boolean',
    default: false
  })
  .option('babel', {
    describe: 'Use Babel to compile the files.',
    type: 'boolean',
    default: false
  })
  .option('es2015', {
    describe: 'Is your code written in ES2015?',
    type: 'boolean',
    default: false
  })
  .option('index', {
    describe: 'Path to a custom HMTL index file.',
    type: 'string'
  })
  .option('jsx', {
    describe: 'Does your code uses JSX syntax?',
    type: 'boolean',
    default: false
  })
  .option('minify', {
    describe: 'Minify the bundle.',
    type: 'boolean',
    default: false
  })
  .option('pragma', {
    describe: 'JSX pragma.',
    type: 'string'
  })
  .option('presets', {
    describe: 'Babel 6 presets separated by a comma (example: es2015,react).',
    type: 'string'
  })
  .option('progress', {
    describe: 'Should it display the compilation\'s progress?',
    type: 'boolean',
    default: false
  })
  .option('public', {
    describe: 'Path to a public folder.',
    type: 'string'
  })
  .option('quiet', {
    describe: 'Disable logs.',
    type: 'boolean',
    default: false
  })

  // Examples
  .example('kotatsu start script.js', 'Launching the given script with HMR.')
  .example('kotatsu start --es2015 scripts.js', 'Launching a ES2015 script.')
  .example('kotatsu start -c webpack.config.js script.js', 'Using a specific webpack config.')
  .example('kotatsu start --source-maps script.js', 'Computing source maps.')
  .example('kotatsu start script.js -- --path test.js', 'Passing arguments to the script.')
  .example('')
  .example('kotatsu serve entry.js', 'Serving the given app.')
  .example('kotatsu serve --es2015 --jsx entry.jsx', 'Serving the given ES2015 & JSX app.')
  .example('kotatsu serve --port 8000 entry.jsx', 'Serving the app on a different port.')
  .example('kotatsu serve --babel entry.js', 'Enable Babel to use .babelrc files.')
  .example('')
  .example('kotatsu build server --es2015 entry.js -o ./', 'Build the given script.')
  .example('kotatsu build client entry.js -o build', 'Build the given client app.')

  // Help & Version
  .version(pkg.version)
  .help('h')
  .alias('h', 'help')
  .showHelpOnFail(false, 'Use the --help option to get the list of available options.')
  .epilogue('Repository: ' + pkg.repository.url)
  .argv;

var command = argv._[0],
    entry = argv._[1],
    config = {},
    side;

if (command === 'build') {
  side = entry === 'client' ? 'front' : 'back';
  entry = argv._[2];
}

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

var publicPaths = argv.public ?
  [].concat(argv.public).map(function(p) {
    return path.resolve(cwd, p);
  }) :
  null;

var opts = {
  args: argv._.slice(EXPECTED_PARTS),
  babel: argv.babel,
  cwd: cwd,
  config: config,
  devtool: argv.devtool,
  entry: path.resolve(cwd, entry),
  es2015: argv.es2015,
  index: argv.index ? path.resolve(cwd, argv.index) : null,
  public: publicPaths,
  jsx: argv.jsx,
  minify: argv.minify,
  mountNode: argv.mountNode,
  output: argv.output ? path.resolve(cwd, argv.output) : null,
  port: argv.port,
  pragma: argv.pragma,
  presets: argv.presets ? argv.presets.split(',') : null,
  progress: argv.progress,
  quiet: argv.quiet,
  sourceMaps: argv.sourceMaps
};

// Cleaning null values
for (var k in opts)
  if (opts[k] === null || opts[k] === undefined)
    delete opts[k];

// Applying the correct method.
if (command === 'start') {
  kotatsu.start(opts);
}
else if (command === 'serve') {
  kotatsu.serve(opts);
}
else if (command === 'run') {
  kotatsu.run(opts);
}
else if (command === 'build') {
  kotatsu.build(side, opts);
}
else {
  console.error('The "' + command + '" command is not yet implemented.');
  process.exit(1);
}
