'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const xml2js = require('xml2js');
const builder = new xml2js.Builder();

let clientOptionsRuleBased = {
  host: 'http://localhost:8080/',
  path: '/RuleBaseService/RuleBaseService',
  wsdl: '/RuleBaseService/RuleBaseService?WSDL',
};

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
    listener.listen('translatorXMLQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        let messageToSend = {
          LoanRequest: {
            ssn: message.message.ssn,
            creditScore: message.message.creditScore,
            loanAmount: message.message.loanAmount,
            loanDuration: '1972-01-01 01:00:00.0 CET'
          }
        };

        let xmlMessage = builder.buildObject(messageToSend);
        let producer = new Producer(amqp, {
          host: message.recipient.host
        });

        // console.log('In translator xml', xmlMessage);

        producer.startErrorHandler();
        producer.publish('*', xmlMessage, exchangeOptions, message.recipient.exchange, {
          replyTo: 'groupXjsonResponse',
          headers: header
        });
      }
    });
  }

}

module.exports = TranslatorJSON;