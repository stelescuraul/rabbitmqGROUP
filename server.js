'use strict';
//Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cors = require('cors');

const io = require('socket.io');
const easysoap = require('easysoap');
const amqp = require('amqp');

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
let Socket = require('./sockets/socketServer');
let Soap = require('./soap/soapClient');

let mySocketServer = new Socket(io, http);
mySocketServer.startListening();

// let clientOptions = {
//   host: 'http://139.59.154.97:8080/',
//   path: '/CreditScoreService/CreditScoreService',
//   wsdl: '/CreditScoreService/CreditScoreService?wsdl',
// };

let clientOptionsRuleBased = {
  host: 'http://localhost:8080/',
  path: '/RuleBaseService/RuleBaseService',
  wsdl: '/RuleBaseService/RuleBaseService?WSDL',
};

// let soapClient = new Soap(easysoap, clientOptions);

let soapClientRules = new Soap(easysoap, clientOptionsRuleBased);

// List the functions in the rule based client wsdl
// soapClientRules.soapClient.getAllFunctions()
//   .then((functionArray) => {
//     console.log(functionArray);
//   })
//   .catch((err) => {
//     throw new Error(err);
//   });

// Calls the method in rule service
// soapClientRules.callMethod('chooseAppropriateBank', {
//   ssn: '120402-2312',
//   creditScore: 556,
//   loanAmount: 200,
//   loanDuration: 1.0
// }).then((response) => {
//   console.log(response);
// }).catch((err) => {
//   console.log(err);
// });

// soapClient.callMethod('creditScore', {
//   ssn: '120402-2312'
// }).then((response) => {
//   console.log(response);
// }).catch((err) => {
//   console.log(err);
// });

let Producer = require('./amqp/producer');
let producer = new Producer(amqp, {
  host: '10.0.0.200'
});

let channel = "directChannel";
let exchangeOptions = {
  type: 'direct',
  autoDelete: false
};
let exchangeName = "directExchange";
let queueName = "directQueue";
let queueOptions = {
  autoDelete: false,
  durable: true
};
let bindCriteria = '*';
let publishOptions = {
  headers: {
    foo: 'bar',
    bar: 'foo',
    number: '123',
    stuff: [{
      x: 1
    }, {
      x: 2
    }]
  }
};

producer.startErrorHandler();
// producer.setup(".rulesQueue", exchangeOptions, 'groupXexchange', 'rulesQueue', queueOptions);
// producer.publish(".rulesQueue", "Hello from producer", exchangeOptions, 'groupXexchange', {});
// producer.publish("*", "Hello from producer2", exchangeOptions, exchangeName, "wtfQueue", queueOptions, "hi", publishOptions);
// producer.publish(channel, "Hello from producer", exchangeOptions, exchangeName, queueName, queueOptions, bindCriteria, publishOptions);
// producer.publish(channel, "Hello from producer", exchangeOptions, exchangeName, queueName, queueOptions, bindCriteria, publishOptions);


let CreditScore = require('./core/creditScore');
let creditScore = new CreditScore();

creditScore.enrich({
  ssn: "123456-7822",
  loanAmount: 300.22,
  loanDuration: new Date()
}).then((message) => {
  console.log(message);
}).catch(err => {
  console.log(err);
});

let RuleService = require('./core/ruleService');
let rules = new RuleService();

rules.listen();

// let Listner = require('./amqp/listner');
// let listner = new Listner(amqp, {
//   host: '10.0.0.200'
// });

// listner.startErrorHandler();
// listner.listen(queueName, queueOptions, ".all", exchangeName, exchangeOptions, (message, header, deliveryInfo, messageObject) => {
//   console.log(message.data.toString('utf8'), header);
//   console.log('WTF');
// });

// let listner2 = new Listner(amqp, {
//   host: '10.0.0.200'
// });

// listner2.startErrorHandler();
// listner2.listen("wtfQueue", queueOptions, '.wtf', exchangeName, exchangeOptions, (message, header, deliveryInfo, messageObject) => {
//   console.log(message.data.toString('utf8'), header);
//   console.log('HEre');
// });


http.listen(port);
console.log(`Listening on port: ${port}`);