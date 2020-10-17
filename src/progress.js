/**
 * Kotatsu Progress Webpack Plugin
 * ================================
 *
 * Simple plugin to display a progress bar when compiling the bundle.
 */
var webpack = require('webpack'),
    ProgressBar = require('progress'),
    chalk = require('chalk');

module.exports = function progress() {

  var fmt = ':header Compiling [:bar] :percent';
  var bar = new ProgressBar(fmt, {
    total: 30,
    width: 30,
    incomplete: ' ',
    complete: '='
  });

  var header = chalk.blue('[kotatsu]');

  var done = false;

  return new webpack.ProgressPlugin(function(percent, message) {
    if (done)
      return;
    if (message === 'done') {
      done = true;
      bar.update(1, {header: header});
      return;
    }

    bar.update(percent, {header: header});
  });
};
