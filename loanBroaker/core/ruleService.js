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
  host: 'datdb.cphbusiness.dk'
};

const queueOptions = {
  autoDelete: false,
  durable: true
};

let listener = new Listener(amqp, amqpOptions);


class RulesService {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('groupXRulesQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message) && message.ssn && _.isString(message.ssn) && message.loanAmount &&
        _.isNumber(message.loanAmount) && message.loanDuration &&
        message.creditScore && _.isNumber(message.creditScore)) {
        message.creditScore = message.creditScore;
        let messageToSend = {
          message: message,
          banks: []
        };
        soapClientRules.callMethod('chooseAppropriateBank', message).then((response) => {
          let producer = new Producer(amqp, amqpOptions);
          producer.startErrorHandler();

          _.forEach(response.chooseAppropriateBankResponse, (bank) => {
            if (bank.hasOwnProperty('return')) messageToSend.banks.push(bank.return);
            else messageToSend.banks.push(bank);
          });

          let exchangeOptions = {
            type: 'direct',
            autoDelete: false
          };
          producer.publish('.groupXRecipientList', messageToSend, exchangeOptions, 'groupXexchange', {
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