/**
 * Kotatsu Progress Webpack Plugin
 * ================================
 *
 * Simple plugin to display a progress bar when compiling the bundle.
 */
var webpack = require('webpack'),
    ProgressBar = require('progress');

module.exports = function progress() {

  var fmt = 'Compiling - [:bar] :percent ';
  var bar = new ProgressBar(fmt, {
    total: 30,
    width: 30,
    incomplete: ' ',
    complete: '='
  });

  return new webpack.ProgressPlugin(function(percent, message) {
    bar.fmt = fmt + message;
    bar.update(percent);
  });
};
