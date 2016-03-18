/**
 * Kotatsu Resolver
 * =================
 *
 * Alternative to `require.resolve` that can survive to harsh environments
 * such as Windows.
 */
var slash = require('slash');

module.exports = function resolve(path) {
  return slash(require.resolve(path));
};
