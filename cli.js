#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 */
var kotatsu = require('./index.js'),
    argv = require('yargs').argv;

var entry = argv._[0];

var watcher = kotatsu({entry: entry});
