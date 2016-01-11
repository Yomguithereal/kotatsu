var string = require('./string.js');

if (module.hot) {
  module.hot.accept('./string.js', function() {
    string = require('./string.js');
  });
}

setInterval(() => {
  console.log(string);
}, 1000);
