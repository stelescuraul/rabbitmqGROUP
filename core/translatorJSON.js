'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');

let clientOptionsRuleBased = {
  host: 'http://localhost:8080/',
  path: '/RuleBaseService/RuleBaseService',
  wsdl: '/RuleBaseService/RuleBaseService?WSDL',
};

let soapClientRules = new Soap(easysoap, clientOptionsRuleBased);

const amqpOptions = {
  host: '10.0.0.200'
};

const queueOptions = {
  autoDelete: false,
  durable: true
};

let exchangeOptions = {
  type: 'fanout',
  autoDelete: false
};

let listener = new Listener(amqp, amqpOptions);

class TranslatorJSON {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('translatorJSONQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        let messageToSend = {
          ssn: message.message.ssn,
          creditScore: message.message.creditScore,
          loanAmount: message.message.loanAmount,
          loanDuration: 720
        };

        let producer = new Producer(amqp, {
          host: message.recipient.host
        });

        producer.startErrorHandler();
        producer.publish('*', messageToSend, exchangeOptions, message.recipient.exchange, {
          replyTo: 'groupXjsonResponse',
          headers: header
        });
      }
    });
  }

}

module.exports = TranslatorJSON;