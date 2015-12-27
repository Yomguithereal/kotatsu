/**
 * Kotatsu Hot Process Update
 * ===========================
 *
 * Processing the HMR updates.
 */
var log = require('../helpers.js').log;

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
    log('info', 'Checking for updates...');

  // Checking updates
  function check() {
    module.hot.check(function(err, updatedModules) {
      if (err) return handleError(err);

      if (!updatedModules) {
        log('warn', 'Cannot find update (Full reload needed)');
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
      log('error', [
        'Cannot check for update (Full reload needed)',
        err.stack || err.message
      ]);
      return;
    }

    log('error', 'Update check failed: ' + err.stack || err.message);
  }

  // Logging results
  function logResults(updatedModules, renewedModules) {
    var unacceptedModules = updatedModules.filter(function(moduleId) {
      return renewedModules && renewedModules.indexOf(moduleId) < 0;
    });

    if (unacceptedModules.length > 0) {
      log('warning', 'The following modules couldn\'t be hot updated: (They would need a full reload!)');
      log('warning', unacceptedModules.map(function(moduleId) {
        return '  - ' + moduleMap[moduleId] || moduleId;
      }));
    }

    if (!renewedModules || !renewedModules.length)
      return log('warning', 'Nothing hot updated.');

    log('success', 'Updated modules:');
    log('success', renewedModules.map(function(moduleId) {
      return '  - ' + moduleMap[moduleId] || moduleId;
    }));
  }

  check();
};
