'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');

let clientOptionsRuleBased = {
  host: 'http://localhost:7999/',
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

let listener = new Listener(amqp, {
  host: '10.0.0.200'
});


class RulesService {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('rulesQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message) && message.ssn && _.isString(message.ssn) && message.loanAmount &&
        _.isNumber(message.loanAmount) && message.loanDuration &&
        message.creditScore && _.isNumber(message.creditScore)) {
        // message.loanDuration = '1972-01-01 01:00:00.0 CET';
        // message.loanDuration = '1972-01-01 01:00:00.0 CET';
        message.creditScore = 700;
        let messageToSend = {
          message: message,
          banks: []
        };
        soapClientRules.callMethod('chooseAppropriateBank', message).then((response) => {
          let producer = new Producer(amqp, amqpOptions);
          producer.startErrorHandler();

          _.forEach(response.chooseAppropriateBankResponse, (bank) => {
            messageToSend.banks.push(bank.return);
          });

          let exchangeOptions = {
            type: 'direct',
            autoDelete: false
          };

          producer.publish('.recipientList', messageToSend, exchangeOptions, 'groupXexchange', {
            headers: header
          });
        }).catch((err) => {
          console.log(err);
        });
      }
    });
  }

}

module.exports = RulesService;