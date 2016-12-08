'use strict';
//Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

const io = require('socket.io');
const easysoap = require('easysoap');
const amqp = require('amqp');
const Socket = require('./sockets/socketServer');

const CreditScore = require('./core/creditScore');
const RuleService = require('./core/ruleService');
const RecipientList = require('./core/recipientList');
const TranslatorJSON = require('./core/translatorJSON');
const TranslatorXML = require('./core/translatorXML');
const Normalizer = require('./core/normalizer');
const Aggregator = require('./core/aggregator');

let creditScore = new CreditScore();
let rules = new RuleService();
let recipientList = new RecipientList();
let translatorJSON = new TranslatorJSON();
let translatorXML = new TranslatorXML();
let normalizer = new Normalizer();
let aggregator = new Aggregator();

// =======================
// configuration =========
// =======================
let app = express();
const port = process.env.PORT || 1337;

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.raw());
app.use(methodOverride());

// development error handler
// will print stacktrace
if (app.get('env') === 'development' || app.get('env') === 'test') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      name: err.name,
      message: err.message,
      error: {}
    });
  });
}

const http = require('http').Server(app);

let mySocketServer = new Socket(io, http);
mySocketServer.startListening();

creditScore.listen();
rules.listen();
recipientList.listen();
translatorJSON.listen();
translatorXML.listen();
normalizer.listen();
aggregator.listen();

http.listen(port);
console.log(`Listening on port: ${port}`);