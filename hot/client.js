/*
 * Kotatsu Hot
 * ============
 *
 * The library's take on Webpack's client hot loading logic.
 */
var processUpdate = require('./process-update.js'),
    logger = require('./logger.js');

if (!module.hot)
  throw Error('[kotatsu]: Hot Module Replacement is disabled.');

logger.info('HMR connected.');

// Listening to updates from the parent process
process.on('message', function(data) {
  if (!data && !data.__hmrUpdate)
    return;

  var type = data.type;

  if (type === 'update') {
    var status = module.hot.status();

    if (status !== 'idle') {
      logger.warn('Got message from parent but currently in ' + status + ' state.');
      logger.warn('Need to be in idle state to start hot update.');

      return;
    }

    return processUpdate(data.hash, data.modules || {});
  }
});
