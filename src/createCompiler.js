/**
 * Kotatsu Compiler Creator
 * =========================
 *
 * Function in charge of creating the webpack compilers for the library.
 */
var webpack = require('webpack'),
    BundleUpdateHookPlugin = require('webpack-bundle-update-hook-plugin'),
    NodePlugin = require('./NodePlugin.js'),
    progress = require('./progress.js'),
    path = require('path'),
    fs = require('fs'),
    _ = require('lodash');

/**
 * Constants.
 */
var NODE_ENVIRONMENT = {
  console: false,
  global: false,
  process: false,
  Buffer: false,
  __filename: false,
  __dirname: false,
  setImmediate: false
};

var BABEL_ES2015 = require.resolve('babel-preset-es2015'),
    BABEL_JSX = require.resolve('babel-plugin-transform-react-jsx'),
    BABEL_LOADER = require.resolve('babel-loader'),
    JSON_LOADER = require.resolve('json-loader'),
    SOURCE_MAP_SUPPORT = require.resolve('source-map-support');

/**
 * Helpers.
 */
function handleEntry(entry, hotClient) {
  var entryConfig;

  if (typeof entry === 'string' || Array.isArray(entry)) {
    entryConfig = [].concat(entry);

    if (hotClient)
      entryConfig.unshift(hotClient);
  }
  else if (typeof entry === 'object') {
    entryConfig = {};

    for (var k in entry) {
      entryConfig[k] = handleEntry(entry[k], hotClient);
    }
  }

  return entryConfig;
}

/**
 * Main function.
 */
module.exports = function createCompiler(opts) {
  var frontEnd = opts.side === 'front',
      backEnd = !frontEnd;

  var hot = opts.hot !== false;

  // NOTE: options take precedence over the webpack config
  var entry = opts.entry || opts.config.entry;

  // Building the entry
  var hotClient = null;

  if (hot) {
    if (backEnd)
      hotClient = path.join(__dirname, '..', 'hot', 'client.js');
    else
      hotClient = require.resolve('webpack-hot-middleware/client');
  }

  var entryConfig = handleEntry(entry, hotClient);

  // Building the output
  var outputConfig = _.merge(
    {
      publicPath: '/build/'
    },
    opts.solvedOutput,
    opts.config.output || {},
    opts.output ? opts.solvedOutput : {}
  );

  // Creating the webpack config
  var config = {
    entry: entryConfig,
    output: outputConfig,

    // TODO: better merge plugins
    plugins: hot ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ] : [],
    module: {}
  };

  // Merging the user's config
  var mergeTarget = _.omit(opts.config || {}, ['entry', 'output', 'plugins']);
  config = _.merge({}, mergeTarget, config);

  // Additional plugins
  config.plugins.unshift(new webpack.optimize.OccurenceOrderPlugin());

  if (frontEnd)
    config.plugins.push(new BundleUpdateHookPlugin());

  if (opts.minify) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());
    config.plugins.push(new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }));
  }

  // Are we creating a config for backend?
  if (backEnd) {

    // Env
    config.context = opts.cwd;
    config.target = 'node';
    config.node = NODE_ENVIRONMENT;

    // Source maps
    config.devtoolModuleFilenameTemplate = '[absolute-resource-path]';

    // Registering node_modules as externals
    config.externals = {};
    fs.readdirSync(path.join(process.cwd(), 'node_modules'))
      .filter(function(p) {
        return p !== '.bin';
      })
      .forEach(function(m) {
        config.externals[m] = 'commonjs ' + m;
      });

    // Applying the node plugin
    config.plugins.unshift(new NodePlugin());
  }

  // Should we display a progress bar?
  if (opts.progress)
    config.plugins.push(progress());

  // Do we want sourcemaps
  if (opts.sourceMaps || opts.devtool) {

    if (backEnd) {
      var sourceMapModulePath = SOURCE_MAP_SUPPORT,
          injectString = 'require(\'' + sourceMapModulePath + '\').install();';

      config.plugins.push(new webpack.BannerPlugin(injectString, {
        raw: true,
        entryOnly: false
      }));
    }

    config.devtool = opts.devtool || 'source-map';
  }

  // Additional loaders
  var loaders = config.module.loaders || [];

  // - JSON
  loaders.push({
    test: /\.json$/,
    loader: JSON_LOADER
  });

  // - Babel & ES2015
  if (opts.babel || opts.es2015 || opts.presets.length) {
    var presets = opts.presets.map(function(p) {
      if (p === 'es2015')
        return BABEL_ES2015;
      return p;
    });

    if (opts.es2015)
      presets.push(BABEL_ES2015);

    // Deduping
    presets = _.uniq(presets);

    var babel = {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      loader: BABEL_LOADER,
      query: {
        presets: presets
      }
    };

    if (opts.jsx && !~opts.presets.indexOf('react')) {
      var plugins = [[BABEL_JSX]];

      if (opts.pragma)
        plugins[0].push({pragma: opts.pragma});

      babel.query.plugins = plugins;
    }

    loaders.push(babel);
  }

  config.module.loaders = loaders;

  return webpack(config);
};
