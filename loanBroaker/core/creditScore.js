'use strict';
const Producer = require('../amqp/producer');
const Listener = require('../amqp/listner');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const moment = require('moment');

let clientOptions = {
  host: 'http://139.59.154.97:8080/',
  path: '/CreditScoreService/CreditScoreService',
  wsdl: '/CreditScoreService/CreditScoreService?wsdl',
};
let soapClient = new Soap(easysoap, clientOptions);

const amqpOptions = {
  host: 'datdb.cphbusiness.dk'
};

const queueOptions = {
  autoDelete: false,
  durable: true
};

let listener = new Listener(amqp, amqpOptions);

class CreditScore {
  constructor() {
    listener.startErrorHandler();
  }

  listen(message) {
    listener.listen('groupXCreditScoreQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        if (message.loanDuration) {
          let newDate = moment('1970-01-01').add(message.loanDuration, 'days').toDate();
          message.loanDuration = newDate;
        }
        if (message.ssn && _.isString(message.ssn) && message.loanAmount && _.isNumber(message.loanAmount) && message.loanDuration && _.isDate(message.loanDuration)) {
          let exp = new RegExp('[0-9]{6}-[0-9]{4}');
          if (exp.test(message.ssn)) {

            soapClient.callMethod('creditScore', {
              ssn: message.ssn
            }).then((response) => {
              let producer = new Producer(amqp, amqpOptions);
              producer.startErrorHandler();

              let creditScore = parseInt(response.creditScoreResponse.return);
              // let creditScore = 730;
              let ssn = message.ssn.split('-').join('');
              let loanAmount = parseFloat(message.loanAmount.toFixed(2));
              let loanDuration = message.loanDuration;

              let queueMessage = {
                ssn,
                creditScore,
                loanAmount,
                loanDuration
              };
              let exchangeOptions = {
                type: 'direct',
                autoDelete: false
              };
              let messageOptions = {
                headers: header
              };
              producer.publish('.groupXRules', queueMessage, exchangeOptions, 'groupXexchange', messageOptions);
            }).catch((err) => {
              console.log('Error');
            });
          }
        }
      }
    });
  }
}

module.exports = CreditScore;