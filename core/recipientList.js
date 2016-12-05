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
  type: 'direct',
  autoDelete: false
};

let listener = new Listener(amqp, amqpOptions);

const bankslist = {
  // 'cphbusiness.bankService': {
  //   host: '',
  //   type: 'xml',
  //   exchange: 'cphbusiness.bankService',
  //   translator: '.translatorXML'
  // },
  'cphbusiness.bankXML': {
    host: 'datdb.cphbusiness.dk',
    type: 'xml',
    exchange: 'cphbusiness.bankXML',
    translator: '.translatorXML'
  },
  'cphbusiness.bankJSON': {
    host: 'datdb.cphbusiness.dk',
    type: 'json',
    exchange: 'cphbusiness.bankJSON',
    translator: '.translatorJSON'
  }
};

class RecipientList {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('recipientQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      // console.log(message);
      if (message && message.message && message.banks && _.isObject(message.message) && _.isArray(message.banks)) {
        if (message.banks.length !== 0) {
          let producer = new Producer(amqp, amqpOptions);
          producer.startErrorHandler();
          let count = 0;
          message.recipients = [];
          _.forEach(message.banks, function (bankName) {
            let currentBank = bankslist[bankName];
            if (currentBank && !_.isEmpty(currentBank)) {
              message.recipients.push(currentBank);
              count++;
            }
          });
          _.forEach(message.recipients, function (recipient) {
            let messageToSend = {
              message: message.message,
              recipient: recipient
            };
            // console.log("recipient", messageToSend);
            producer.publish(recipient.translator, messageToSend, exchangeOptions, 'groupXexchange', {
              headers: {
                totalNumberOfMsg: count,
                type: recipient.type
              }
            });
          });
        } else {
          console.log('Should not be send to anyone ');
        }
      }
    });
  }

}

module.exports = RecipientList;