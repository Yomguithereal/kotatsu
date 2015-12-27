/*
 * Kotatsu Hot
 * ============
 *
 * The library's take on Webpack's client hot loading logic.
 */
var processUpdate = require('./process-update.js');

if (!module.hot)
  throw Error('[kotatsu]: Hot Module Replacement is disabled.');

// Listening to updates from the parent process
process.on('message', function(data) {
  if (!data && !data.__hmrUpdate)
    return;

  var status = module.hot.status();

  if (status !== 'idle') {
    log('warning', [
      'Got message from parent but currently in ' + status + ' state.',
      'Need to be in idle state to start hot update.'
    ]);

    return;
  }

  processUpdate(data.hash);
});
