var kotatsu = require('../kotatsu.js'),
    path = require('path');

kotatsu.serve({
  entry: path.join(__dirname, './interval/interval.js'),
  server: function(app) {
    app.get('/hello', function(req, res) {
      return res.send('Hello World!');
    });
  }
});
