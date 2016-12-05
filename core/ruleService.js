'use strict';
const Listener = require('../amqp/listner');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');

// let clientOptions = {
//   host: 'http://139.59.154.97:8080/',
//   path: '/CreditScoreService/CreditScoreService',
//   wsdl: '/CreditScoreService/CreditScoreService?wsdl',
// };
// let soapClient = new Soap(easysoap, clientOptions);

const amqpOptions = {
  host: '10.0.0.200'
};

const queueOptions = {
  autoDelete: false,
  durable: true
};

let listener = new Listener(amqp, {
  host: '10.0.0.200'
});

class RulesService {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('rulesQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      console.log(message, header);
    });
  }

}

module.exports = RulesService;