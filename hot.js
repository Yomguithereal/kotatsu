/**
 * Kotatsu Hot
 * ============
 *
 * The library's take on Webpack's client hot loading logic.
 */
var chalk = require('chalk');

// Constants
var LOG_COLORS = {
  success: 'green',
  warning: 'yellow',
  error: 'red'
};

var FAILURE_STATUSES = {
  abort: true,
  fail: true
};

// Helpers
function log(status, lines) {
  lines = [].concat(lines).map(function(line) {
    return '[' + chalk[LOG_COLORS[status]]('kotatsu') + '] ' + line;
  });

  console.log(lines.join('\n'));
}

function logResult(updatedModules, renewedModules) {
  var unacceptedModules = updatedModules.filter(function(moduleId) {
    return renewedModules && renewedModules.indexOf(moduleId) < 0;
  });

  if (unacceptedModules.length > 0) {
    log('warning', 'The following modules couldn\'t be hot updated: (They would need a full reload!)');
    log('warning', unacceptedModules.map(function(moduleId) {
      return '  - ' + moduleId;
    }));
  }

  if (!renewedModules || !renewedModules.length)
    return log('warning', 'Nothing hot updated.');

  log('success', 'Updated modules:');
  log('success', renewedModules.map(function(moduleId) {
    return '  - ' + moduleId;
  }));
}

// Main
if (module.hot) {

  // Applying the received updates
  function checkForUpdate(fromUpdate) {

    // Checking
    module.hot.check(function(err, updatedModules) {

      // An error occurred
      if (err) {
        if (module.hot.status() in FAILURE_STATUSES) {
          log('error', [
            'Cannot apply update.',
            err.stack || err.message,
            'You need to restart the application!'
          ]);
        }
        else {
          log('error', 'Update failed: ' + err.stack || err.message);
        }

        return;
      }

      // No update to be found
      if (!updatedModules) {
        if (fromUpdate)
          log('success', 'Update applied.');
        else
          log('warning', 'Cannot find update.');

        return;
      }

      // Applying changes
      module.hot.apply({ignoreUnaccepted: true}, function(err, renewedModules) {
        if (err) {
          if (module.hot.status() in FAILURE_STATUSES) {
            log('error', [
              'Cannot apply update (Nedd to do a full reload!)',
              err.stack || err.message,
              'You need to restart the application!'
            ]);
          }
          else {
            log('Update failed: ' + err.stack || err.message);
          }

          return;
        }

        logResult(updatedModules, renewedModules);

        checkForUpdate(true);
      });
    });
  }

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

    checkForUpdate();
  });
}
else {
  throw Error('[kotatsu]: Hot Module Replacement is disabled.');
}
