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

  compiler.hooks.normalModuleFactory.tap('kotatsu', function(factory) {

    factory.hooks.parser.for('javascript/auto').tap({name: 'kotatsu', expression: '__dirname'}, function(parser) {

      // __dirname
      parser.hooks.expression.for('__dirname').tap('kotatsu', function() {
        if (!parser.state.module)
          return;

        var dirname = path.dirname(parser.state.module.resource);

        parser.state.current.addVariable('__dirname', JSON.stringify(dirname));

        return true;
      });

      // __filename
      parser.hooks.expression.for('__filename').tap('kotatsu', function() {
        if (!parser.state.module)
          return;

        var filename = parser.state.module.resource;

        parser.state.current.addVariable('__filename', JSON.stringify(filename));

        return true;
      });
    });
  });
};

module.exports = NodePlugin;
