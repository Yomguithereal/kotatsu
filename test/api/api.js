var app = require('express')();

app.get('/data.json', function(req, res) {
  return res.json({hello: 'world'});
});

app.use(function(req, res) {
  return res.send('API: Not Found! ' + req.url);
});

console.log('Api listening on port ' + 4000);
app.listen(4000);
