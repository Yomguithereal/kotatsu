var dummy = require('./dummy.js');

if (module.hot) {
  module.hot.accept('./dummy.js', function() {
    dummy = require('./dummy.js');
  });
}

setInterval(function() {
  console.log(dummy);
}, 1000);
