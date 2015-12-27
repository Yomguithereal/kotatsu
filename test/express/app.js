var express = require('express'),
    response = require('./response.js');

var app = express();

app.get('/hello', function(req, res) {
  return res.json(response());
});

module.exports = app;
