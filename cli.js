#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 */
var kotatsu = require('./index.js'),
    path = require('path'),
    argv = require('yargs').argv;

var entry = argv._[0],
    config = {};

if (argv.config)
  config = require(path.join(process.cwd(), argv.config));

var watcher = kotatsu({entry: entry, config: config});
