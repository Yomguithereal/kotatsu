/**
 * Kotatsu Compiler Creator
 * =========================
 *
 * Function in charge of creating the webpack compilers for the library.
 */
var webpack = require('webpack'),
    BundleUpdateHookPlugin = require('webpack-bundle-update-hook-plugin'),
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
  __filename: true,
  __dirname: true,
  setImmediate: false
};

var BABEL_ES2015 = require.resolve('babel-preset-es2015'),
    BABEL_JSX = require.resolve('babel-plugin-transform-react-jsx');

// NOTE: handling popular libraries issues with webpack compilation
var NO_PARSE = /node_modules\/json-schema\/lib\/validate\.js/;

/**
 * Main function.
 */
module.exports = function createCompiler(opts) {
  var frontEnd = opts.command === 'serve',
      backEnd = !frontEnd,
      monitor = opts.command === 'monitor';

  var entry = opts.entry,
      output = opts.output;

  // Building the entry
  var entries = [];

  if (backEnd)
    entries.push(path.join(__dirname, '..', 'hot', 'client.js'));

  if (frontEnd)
    entries.push('webpack-hot-middleware/client');

  entries.push(entry);

  // Creating the webpack config
  var config = {
    entry: entries,
    output: {
      path: frontEnd ? '/kotatsu' : output,
      filename: 'bundle.js',
      publicPath: '/build/'
    },
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new BundleUpdateHookPlugin()
    ],
    module: {}
  };

  // Are we creating a config for backend?
  if (backEnd) {

    // Env
    config.target = 'node';
    config.node = NODE_ENVIRONMENT;
    config.module.noParse = NO_PARSE;

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
  }

  // Should we display a progress bar?
  if (opts.progress)
    config.plugins.push(progress());

  // Do we want sourcemaps
  if (opts.sourceMaps) {

    if (backEnd) {
      var sourceMapModulePath = require.resolve('source-map-support'),
          injectString = 'require(\'' + sourceMapModulePath + '\').install();';

      config.plugins.push(new webpack.BannerPlugin(injectString, {
        raw: true,
        entryOnly: false
      }));
    }

    config.devtool = opts.devtool || 'source-map';
  }

  // Merging the user's config
  // NOTE: our config should take precedence over the user's one.
  config = _.merge({}, opts.config || {}, config);

  // Additional loaders
  var loaders = config.module.loaders || [];

  //- ES2015
  if (opts.es2015 || opts.presets.length) {
    var presets = opts.presets.map(function(p) {
      if (p === 'es2015')
        return BABEL_ES2015;
      return p;
    });

    if (!presets.length)
      presets = [BABEL_ES2015];

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
