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
    BABEL_JSX = require.resolve('babel-plugin-transform-react-jsx');

/**
 * Main function.
 */
module.exports = function createCompiler(opts) {
  var frontEnd = opts.side === 'front',
      backEnd = !frontEnd;

  var hot = opts.hot !== false;

  var entry = opts.entry,
      output = opts.output;

  // Building the entry
  var entries = [];

  if (hot) {
    if (backEnd)
    entries.push(path.join(__dirname, '..', 'hot', 'client.js'));

    if (frontEnd)
      entries.push('webpack-hot-middleware/client');
  }

  entries.push(entry);

  // Creating the webpack config
  var config = {
    entry: entries,
    output: {
      path: frontEnd && !opts.build ? '/kotatsu' : output.directory,
      filename: output.filename || 'bundle.js',
      publicPath: '/build/'
    },
    plugins: hot ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin(),
      new BundleUpdateHookPlugin()
    ] : [],
    module: {}
  };

  // Additional plugins
  config.plugins.unshift(new webpack.optimize.OccurenceOrderPlugin());

  if (opts.minify)
    config.plugins.push(new webpack.optimize.UglifyJsPlugin());

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
      var sourceMapModulePath = require.resolve('source-map-support'),
          injectString = 'require(\'' + sourceMapModulePath + '\').install();';

      config.plugins.push(new webpack.BannerPlugin(injectString, {
        raw: true,
        entryOnly: false
      }));
    }

    config.devtool = opts.devtool || 'source-map';
  }

  // Merging the user's config
  // NOTE: our config should take precedence over the user's one.
  // TODO: apply better merging when possible
  config = _.merge({}, opts.config || {}, config);

  // Additional loaders
  var loaders = config.module.loaders || [];

  // - JSON
  loaders.push({
    test: /\.json$/,
    loader: require.resolve('json-loader')
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
      loader: require.resolve('babel-loader'),
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
