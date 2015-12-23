/**
 * Kotatsu Library
 * ================
 *
 */
var webpack = require('webpack');

module.exports = function(opts) {
  opts = opts || {};

  // TODO: Poll or signal?
  var config = {
    entry: [
      'webpack/hot/poll?1000',
      opts.entry
    ],
    target: 'node',
    output: {
      path: '.kotatsu',
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  };

  var compiler = webpack(config);

  return compiler;
};
