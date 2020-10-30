/**
 * Kotatsu Server Creator
 * =======================
 *
 * Creates an express server fit to serve a bundled application and send
 * hot-loading updates.
 */
var express = require('express'),
    createProxyMiddleware = require('http-proxy-middleware').createProxyMiddleware,
    cors = require('cors'),
    dev = require('webpack-dev-middleware'),
    hot = require('webpack-hot-middleware'),
    _ = require('lodash');

/**
 * Constants.
 */
var DEV_MIDDLEWARE_OPTS = {
  publicPath: '/build/'
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
    '    <meta charset="utf-8" />',
    '    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">',
    '  </head>',
    '  <body>',
    '    <div id="' + mountNode + '"></div>',
    '    <script type="text/javascript" src="/build/bundle.js"></script>',
    '  </body>',
    '</html>'
  ].join('\n');
}

function copyHeadersToRequest(proxyReq, req) {
  Object.keys(req.headers).forEach(function (key) {
    proxyReq.setHeader(key, req.headers[key]);
  });
}

function copyHeadersToResponse(proxyRes, req, res) {
  Object.keys(proxyRes.headers).forEach(function (key) {
    res.append(key, proxyRes.headers[key]);
  });
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
  if (opts.cors)
    app.use(cors());

  app.use(dev(compiler, devMiddlewareOpts));
  app.use(hot(compiler, HOT_MIDDLEWARE_OPTS));

  // Index file
  var index = createIndex(opts.mountNode);

  // Public folder
  if (opts.public) {
    opts.public.forEach(function(p) {
      app.use(p[0], express.static(p[1]));
    });
  }

  // Proxy
  if (opts.proxy) {
    var proxies = _.chunk(opts.proxy, 2);

    proxies.forEach(function(spec) {
      var namespace = spec[0],
          target = spec[1],
          pathRewrite = {};

      pathRewrite['^' + namespace] = '';

      app.use(createProxyMiddleware(namespace, {
        target: target,
        pathRewrite: pathRewrite,
        logLevel: 'silent',
        onProxyRes: copyHeadersToResponse,
        onProxyReq: copyHeadersToRequest
      }));
    });
  }

  // Applying custom middlewares
  if (typeof opts.server === 'function')
    opts.server(app);

  // Sending the index
  app.get('*', function(req, res) {

    if (opts.index)
      return res.sendFile(opts.index);

    return res.send(index);
  });

  // res.sendFile
  return app;
};
