/**
 * Kotatsu Compiler Creator
 * =========================
 *
 * Function in charge of creating the webpack compilers for the library.
 */
var webpack = require('webpack'),
    progress = require('./progress.js'),
    path = require('path'),
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

var NO_PARSE = /node_modules\/json-schema\/lib\/validate\.js/;

/**
 * Main function.
 */
module.exports = function createCompiler(opts) {
  var backEnd = opts.side === 'back-end',
      frontEnd = !backEnd;

  var entry = opts.entry,
      output = opts.output;

  // Creating the webpack config
  var config = {
    entry: [
      path.join(__dirname, '..', 'hot', 'client.js'),
      entry
    ],
    output: {
      path: output,
      filename: 'bundle.js',
      devtoolModuleFilenameTemplate: '[absolute-resource-path]'
    },
    target: 'node',
    node: NODE_ENVIRONMENT,
    plugins: [
      new webpack.optimize.OccurenceOrderPlugin(),
      new webpack.HotModuleReplacementPlugin(),
      progress()
    ],
    module: {
      noParse: NO_PARSE
    }
  };

  // Do we want sourcemaps
  if (opts.sourcemaps) {
    var sourceMapModulePath = require.resolve('source-map-support'),
        injectString = 'require(\'' + sourceMapModulePath + '\').install();';

    config.devtool = 'source-map';
    config.plugins.push(new webpack.BannerPlugin(injectString, {
      raw: true,
      entryOnly: false
    }));
  }

  // Merging the user's config
  // NOTE: our config should take precedence over the user's one.
  config = _.merge({}, opts.config || {}, config);

  // Additional loaders
  var loaders = config.module.loaders || [];

  //- JSON
  if (backEnd)
    loaders.push({
      test: /\.json$/,
      loader: require.resolve('json-loader')
    });

  config.module.loaders = loaders;

  return webpack(config);
};
