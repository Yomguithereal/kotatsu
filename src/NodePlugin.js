/**
 * Kotatsu Node Plugin
 * ====================
 *
 * Webpack plugin in charge of setting __dirname and __filename to the correct
 * values so that scripts run by kotatsu behave the exact same way as they would
 * in node.
 *
 * This is for dev only and should not be use to build production builds for
 * the same reason webpack doesn't allow absolute path to replace __dirname etc.
 * so that those paths don't leak.
 */
var path = require('path');

function NodePlugin() {}

NodePlugin.prototype.apply = function(compiler) {

  // __dirname
  compiler.parser.plugin('expression __dirname', function() {
    if (!this.state.module)
      return;

    var dirname = path.dirname(this.state.module.resource);

    this.state.current.addVariable('__dirname', JSON.stringify(dirname));

    return true;
  });

  // __filename
  compiler.parser.plugin('expression __filename', function() {
    if (!this.state.module)
      return;

    var filename = this.state.module.resource;

    this.state.current.addVariable('__filename', JSON.stringify(filename));

    return true;
  });
};

module.exports = NodePlugin;
