var express = require('express'),
    hello = require('./hello.js'),
    goodbye = require('./goodbye.json');

var app = express();

app.get('/hello', function(req, res) {
  return res.json(hello());
});

app.get('/goodbye', function(req, res) {
  return res.json(goodbye);
});

module.exports = app;
