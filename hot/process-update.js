/**
 * Kotatsu Hot Process Update
 * ===========================
 *
 * Processing the HMR updates.
 */
var logger = require('./logger.js');

if (!module.hot)
  throw Error('[kotatsu]: Hot Module Replacement is disabled.');

/**
 * Constants.
 */
var FAILURE_STATUSES = {
  abort: true,
  fail: true
};

var APPLY_OPTIONS = {
  ignoreUnaccepted: true
};

/**
 * State.
 */
var lastHash = null;

/**
 * Helpers.
 */
function upToDate(hash) {
  if (hash)
    lastHash = hash;
  return lastHash === __webpack_hash__;
}

/**
 * Main.
 */
module.exports = function(hash, moduleMap, options) {
  if (!upToDate(hash) && module.hot.status() === 'idle')
    logger.info('Checking for updates...');

  // Checking updates
  function check() {
    module.hot.check(function(err, updatedModules) {
      if (err) return handleError(err);

      if (!updatedModules) {
        logger.warn('Cannot find update any update.');
        return;
      }

      apply(updatedModules);
    });
  }

  // Applying updates
  function apply(updatedModules) {
    module.hot.apply(APPLY_OPTIONS, function(err, renewedModules) {
      if (err) return handleError(err);

      if (!upToDate())
        check();

      logResults(updatedModules, renewedModules);
    });
  }

  // Handling errors
  function handleError(err) {
    if (module.hot.status() in FAILURE_STATUSES) {
      logger.error('Cannot check for update (Full reload needed)');
      logger.error(err.stack || err.message);
      return;
    }

    logger.error('Update check failed: ' + err.stack || err.message);
  }

  // Logging results
  function logResults(updatedModules, renewedModules) {
    var unacceptedModules = updatedModules.filter(function(moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if (unacceptedModules.length > 0) {
      logger.warn('The following modules couldn\'t be hot updated: (They would need a full reload!)');
      unacceptedModules.forEach(function(moduleId) {
        logger.warn('  - ' + moduleMap[moduleId] || moduleId);
      });
    }

    if (!renewedModules || !renewedModules.length)
      return logger.warn('Nothing hot updated.');

    logger.success('Updated modules:');
    renewedModules.forEach(function(moduleId) {
      logger.success('  - ' + moduleMap[moduleId] || moduleId);
    });
  }

  check();
};
