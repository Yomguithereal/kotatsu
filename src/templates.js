/**
 * Kotatsu Templating Functions
 * =============================
 *
 * Function used to template useful things.
 */
exports.templateIndex = function templateIndex(mountNode) {
  mountNode = mountNode || 'app';

  return [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <title>kotatsu</title>',
    '    <meta charset="utf-8" />',
    '    <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">',
    '  </head>',
    '  <body>',
    '    <div id="' + mountNode + '"></div>',
    '    <script type="text/javascript" src="/build/bundle.js"></script>',
    '  </body>',
    '</html>'
  ].join('\n');
}

exports.templateTsConfig = function templateTsConfig() {
  return {
    compilerOptions: {
      resolveJsonModule: true,
      esModuleInterop: true
    }
  };
}
