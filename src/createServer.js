/**
 * Kotatsu Server Creator
 * =======================
 *
 * Creates an express server fit to serve a bundled application and send
 * hot-loading updates.
 */
var express = require('express'),
    dev = require('webpack-dev-middleware'),
    hot = require('webpack-hot-middleware');

/**
 * Helpers.
 */
function createIndex(mountNode) {
  mountNode = mountNode || 'app';

  return [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>kotatsu</title>',
    '  </head>',
    '  <body>',
    '    <div id="' + mountNode + '"></div>',
    '    <script type="text/javascript" src="/build/bundle.js"></script>',
    '  </body>',
    '</html>'
  ].join('\n');
}

/**
 * Main function.
 */
module.exports = function createServer(compiler, opts) {
  var app = express();

  app.use(dev(compiler, {
    publicPath: '/build/',
    quiet: true
  }));

  app.use(hot(compiler, {
    log: false
  }));

  app.get('/', function(req, res) {
    res.send(createIndex(opts.mountNode));
  });

  // res.sendFile
  return app;
};
