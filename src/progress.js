/**
 * Kotatsu Progress Webpack Plugin
 * ================================
 *
 * Simple plugin to display a progress bar when compiling the bundle.
 */
var webpack = require('webpack'),
    ProgressBar = require('progress');

module.exports = function progress() {

  var fmt = 'Compiling - [:bar] :percent :message';
  var bar = new ProgressBar(fmt, {
    total: 100,
    width: 30,
    incomplete: ' ',
    complete: '='
  });

  return new webpack.ProgressPlugin(function(percent, message) {
    bar.update(percent, {message: message});
  });
};
