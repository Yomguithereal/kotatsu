/**
 * Kotatsu Library
 * ================
 *
 */
var webpack = require('webpack'),
    MemoryFS = require('memory-fs'),
    vm = require('vm');

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
      path: '/kotatsu',
      filename: 'bundle.js'
    },
    plugins: [
      new webpack.HotModuleReplacementPlugin()
    ]
  };

  var compiler = webpack(config);

  // Compiling to memory
  var fs = new MemoryFS();
  compiler.outputFileSystem = fs;

  // Starting to watch
  var running = false;
  compiler.watch({
    aggregateTimeout: 300,
    poll: true
  }, function(err, stats) {

    // Running in VM
    if (!running) {
      var bundle = fs.readFileSync('/kotatsu/bundle.js', 'utf-8');
      vm.runInThisContext(bundle);

      running = true;
    }
  });

  return compiler;
};
