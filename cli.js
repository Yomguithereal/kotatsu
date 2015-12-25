#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 */
var kotatsu = require('./index.js'),
    argv = require('yargs').argv;

var entry = argv._[0],
    config = {};

if (argv.config)
  config = require(argv.config);

var watcher = kotatsu({entry: entry, config: config});
