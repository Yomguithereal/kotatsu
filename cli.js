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

// Building the CLI
var argv = yargs
  .locale('en')
  .usage('Usage: kotatsu {options} [entry]')
  .demand(1)

  // Options
  .option('c', {
    alias: 'config',
    describe: 'Optional webpack config that will be merged with kotatsu\'s one (useful if you need specific loaders).'
  })
  .option('o', {
    alias: 'output',
    describe: 'Optional output directory where built files should be written (DO NOT use an existing directory because it will be erased).'
  })
  .option('s', {
    alias: 'source-maps',
    describe: 'Should source maps be computed for easier debugging?',
    type: 'boolean',
    default: false
  })
  .option('client-side', {
    describe: 'Should kotatsu setup client-side HMR rather than server-side?',
    type: 'boolean',
    default: false
  })
  .option('i', {
    alias: 'index',
    describe: 'Which HTML index file should we serve? If not provided, kotatsu will generate a basic one for you.'
  })

  // Examples
  .example('kotatsu ./script.js', 'Launching the given script with HMR.')
  .example('kotatsu -c webpack.config.js ./script.js', 'Using a specific webpack config.')
  .example('kotatsu --source-maps ./script.js', 'Computing source maps.')

  // Help & Version
  .version(pkg.version)
  .help('h')
  .alias('h', 'help')
  .argv;

var entry = argv._[0],
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

// Creating the watcher
var watcher = kotatsu({
  cwd: cwd,
  entry: path.resolve(cwd, entry),
  config: config,
  output: argv.output,
  sourcemaps: argv.sourcemaps
});
