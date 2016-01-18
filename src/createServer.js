/**
 * Kotatsu Server Creator
 * =======================
 *
 * Creates an express server fit to serve a bundled application and send
 * hot-loading updates.
 */
var express = require('express'),
    dev = require('webpack-dev-middleware'),
    hot = require('webpack-hot-middleware'),
    _ = require('lodash');

/**
 * Constants.
 */
var DEV_MIDDLEWARE_OPTS = {
  publicPath: '/build/',
  quiet: true
};

var HOT_MIDDLEWARE_OPTS = {
  log: false
};

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
    '    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">',
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

  var devMiddlewareOpts = _.merge(
    {},
    DEV_MIDDLEWARE_OPTS,
    _.get(opts, ['config', 'devServer'], {})
  );

  // Middlewares
  app.use(dev(compiler, devMiddlewareOpts));
  app.use(hot(compiler, HOT_MIDDLEWARE_OPTS));

  // Index file
  var index = createIndex(opts.mountNode);

  // Public folder
  if (opts.public) {

    var paths = [].concat(opts.public);

    paths.forEach(function(p) {
      app.use(express.static(p));
    });
  }

  // Sending the index
  app.get('/', function(req, res) {

    if (opts.index)
      return res.sendFile(opts.index);

    return res.send(index);
  });

  // res.sendFile
  return app;
};
