/**
 * Kotatsu Scaffold Command
 * =========================
 *
 * Logic for the scaffolding command.
 */
var chalk = require('chalk');
var templates = require('./templates.js');

var NAMES = ['index.html', 'tsconfig.json'];

module.exports = function scaffold(name, opts) {
  if (!NAMES.includes(name)) {
    console.error('Invalid file name to scaffold:', chalk.cyan(name));
    console.error('Expecting one of:', chalk.cyan(NAMES.join(', ')));
    process.exit(1);
  }

  if (name === 'index.html') {
    console.log(templates.templateIndex(opts.mountNode));
    return;
  }

  if (name === 'tsconfig.json') {
    console.log(JSON.stringify(templates.templateTsConfig(), null, 2));
    return;
  }

  throw new Error('should never happen');
};
