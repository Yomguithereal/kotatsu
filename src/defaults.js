/**
 * Kotatsu Default Options
 * ========================
 *
 * Default options used by every kotatsu command.
 */
module.exports = {
  args: [],
  babel: false,
  cwd: process.cwd(),
  config: null,
  devtool: null,
  es2015: false,
  index: null,
  jsx: false,
  mountNode: 'app',
  output: '.kotatsu',
  port: 3000,
  pragma: null,
  presets: [],
  progress: false,
  public: null,
  quiet: false,
  sourceMaps: false,
};
