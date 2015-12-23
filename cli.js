#!/usr/bin/env node
/**
 * Kotatsu CLI
 * ============
 *
 */
var kotatsu = require('./index.js'),
    argv = require('yargs').argv;

var entry = argv._[0];

var compiler = kotatsu({entry: entry});

compiler.watch({
  aggregateTimeout: 300,
  poll: true
}, function(err, stats) {
  //...
});
