#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 * The CLI tool that will call the lib's function.
 */
var kotatsu = require('./index.js'),
    path = require('path');

// Building the CLI
var argv = require('yargs')
  .locale('en')
  .usage('Usage: kotatsu {options} [entry]')
  .demand(1)

  // Options
  .option('c', {
    alias: 'config',
    describe: 'Optional webpack config that will be merged with kotatsu\'s one (useful if you need specific loaders).'
  })

  // Help
  .help('h')
  .alias('h', 'help')
  .argv;

var entry = argv._[0],
    config = {};

if (argv.config)
  config = require(path.join(process.cwd(), argv.config));

var watcher = kotatsu({
  entry: entry,
  config: config
});
