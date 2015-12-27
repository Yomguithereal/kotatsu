var app = require('./app.js'),
    http = require('http');

var server = http.createServer(app);

server.listen(3000);

if (module.hot) {
  module.hot.accept('./app.js', function() {
    server.removeListener('request', app);
    app = require('./app.js');
    server.on('request', app);
    console.log('Server reloaded!');
  });
}
