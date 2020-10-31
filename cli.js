#!/usr/bin/env node
/* eslint no-shadow: 0 */
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
    _ = require('lodash');

// Handling ES6 configuration
require('@babel/register')({
  only: [/\.babel\.js/],
  presets: ['@babel/env']
});

var CWD = process.cwd();

var COMMANDS = [
  'start',
  'serve',
  'monitor',
  'run',
  'build'
];

var EXPECTED_PARTS = 2;

var USAGE = 'Usage: kotatsu <command> {options} [entry]',
    AVAILABLE_COMMANDS = 'Available commands: ' + COMMANDS.join(', ');

function error(message, details) {
  throw Error('\n' + red('Error: ' + message) + (details ? '\n' + details : ''));
}

var webpackConfig = {},
    entry = null,
    command,
    side;

// Building the CLI
var argv = yargs
  .locale('en')
  .wrap(100)
  .usage(USAGE)
  .pkgConf('kotatsu')
  .check(function(argv) {
    command = argv._[0];

    if (!argv._.length)
      error('Not enough arguments.', [
        USAGE,
        AVAILABLE_COMMANDS
      ].join('\n'));

    if (!Number.isInteger(argv.port))
      error('Invalid port: ' + argv.port);

    if (!~COMMANDS.indexOf(command))
      error(
        'Invalid command: ' + command,
        AVAILABLE_COMMANDS
      );

    // Should we load a config file?
    if (argv.config) {
      try {
        var configPath = require.resolve(path.join(process.cwd(), argv.config));
        webpackConfig = require(configPath);

        // Handling ES6 export
        if ('default' in webpackConfig)
          webpackConfig = webpackConfig.default;
      }
      catch (e) {
        error(
          'Error while loading your config file: "' + argv.config + '".',
          e.stack || ''
        );
      }

      if (webpackConfig.entry)
        EXPECTED_PARTS--;
    }

    // Build specifics
    if (command === 'build') {
      EXPECTED_PARTS++;

      if (argv._.length < EXPECTED_PARTS)
        error('The "build" command takes 2 arguments: client or server, and the entry.');

      if (!~['client', 'server'].indexOf(argv._[1]))
        error('Do you want to build for client or server? You gave: "' + argv._[1] + '".');

      side = argv._[1] === 'client' ? 'front' : 'back';
      entry = argv._[2];
    }
    else {
      if (argv._.length < EXPECTED_PARTS)
        error('Expecting two arguments: the command and the path to your entry.');

      entry = argv._[1];
    }

    // Attempting to resolve our entry
    if (entry) {
      entry = path.resolve(CWD, entry);

      try {
        require.resolve(entry);
      }
      catch (e) {
        error('Could not resolve your entry: "' + argv._[1] + '".', e.stack);
      }
    }

    return true;
  })

  // Commands
  .command('start', 'Start a node.js script.')
  .command('serve', 'Serve a client-side application.')
  .command('monitor', 'Monitor a terminating node.js script.')
  .command('run', 'Run the given node.js script.')
  .command('build', 'Build your code for client or server.')

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
    default: true
  })
  .option('cors', {
    describe: 'Should the server allow CORS?',
    type: 'boolean',
    default: true
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
  .option('pragma', {
    describe: 'JSX pragma.',
    type: 'string'
  })
  .option('sass', {
    describe: 'Whether to transpile scss files (requires `sass` or `node-sass`).',
    type: 'boolean',
    default: false
  })
  .option('typescript', {
    alias: 'ts',
    describe: 'Whether to support TypeScript (requires `typescript`).',
    type: 'boolean',
    default: false
  })
  .option('presets', {
    describe: 'Babel presets separated by a comma (example: @babel/preset-stage-2,@babel/preset-react).',
    type: 'string'
  })
  .option('production', {
    describe: 'Whether to build for production (minify + define).',
    type: 'boolean',
    default: false
  })
  .option('progress', {
    describe: 'Should it display the compilation\'s progress?',
    type: 'boolean',
    default: false
  })
  .option('proxy', {
    describe: 'Proxy information (example: --proxy /api http://localhost:4000)',
    type: 'string',
    nargs: 2
  })
  .option('public', {
    describe: 'Mounting a path to a public folder (example: --public /data ./src/data). Can be used several times.',
    type: 'string',
    nargs: 2
  })
  .option('quiet', {
    describe: 'Disable logs.',
    type: 'boolean',
    default: false
  })

  // Examples
  .example('kotatsu start script.js', 'Launching the given script with HMR.')
  .example('kotatsu start -c webpack.config.js script.js', 'Using a specific webpack config.')
  .example('kotatsu start --no-source-maps script.js', 'Disabling source maps.')
  .example('kotatsu start script.js -- --path test.js', 'Passing arguments to the script.')
  .example('')
  .example('kotatsu serve entry.js', 'Serving the given app.')
  .example('kotatsu serve --jsx entry.jsx', 'Serving the given app with JSX code.')
  .example('kotatsu serve --port 8000 entry.jsx', 'Serving the app on a different port.')
  .example('kotatsu serve --proxy /api http://localhost:4000', 'Proxying an API.')
  .example('kotatsu serve --public /data ./src/data', 'Serving local static files.')
  .example('kotatsu serve --sass entry.js', 'Supporting SASS stylesheets.')
  .example('kotatsu serve --typescript entry.ts', 'Serving a TypeScript app.')
  .example('')
  .example('kotatsu build server entry.js -o ./', 'Build the given server script.')
  .example('kotatsu build client --production entry.js -o ./', 'Build the given client app for production.')

  // Help & Version
  .version(pkg.version)
  .help('h')
  .alias('h', 'help')
  .showHelpOnFail(false, 'Use the --help option to get the list of available options.')
  .epilogue('Repository: ' + pkg.repository.url)
  .argv;

var publicPaths = argv.public;

if (publicPaths) {
  publicPaths = _.chunk(publicPaths, 2).map(function(p) {
    return [p[0], path.resolve(CWD, p[1])];
  });
}

var opts = {
  args: argv._.slice(EXPECTED_PARTS),
  cors: argv.cors,
  cwd: CWD,
  config: webpackConfig,
  devtool: argv.devtool,
  entry: entry ? path.resolve(CWD, entry) : null,
  index: argv.index ? path.resolve(CWD, argv.index) : null,
  public: publicPaths,
  jsx: argv.jsx,
  mountNode: argv.mountNode,
  output: argv.output ? path.resolve(CWD, argv.output) : null,
  port: argv.port,
  pragma: argv.pragma,
  presets: argv.presets ? argv.presets.split(',') : null,
  production: argv.production,
  progress: argv.progress,
  proxy: argv.proxy,
  quiet: argv.quiet,
  sass: argv.sass,
  sourceMaps: argv.sourceMaps,
  typescript: argv.typescript
};

// Cleaning null values
for (var k in opts)
  if (opts[k] === null || opts[k] === undefined)
    delete opts[k];

// Applying the correct method.
if (command === 'build') {
  kotatsu.build(side, opts, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
  });
}
else {
  kotatsu[command](opts);
}
