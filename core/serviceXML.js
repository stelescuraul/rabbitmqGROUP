'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const moment = require('moment');

let clientOptions = {
  path: '/BankWebService/BankWebService',
  wsdl: '/BankWebService/BankWebService?wsdl',
};

const amqpOptions = {
  host: 'datdb.cphbusiness.dk'
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
    listener.listen('groupXServiceXMLQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        clientOptions.host = message.recipient.host;
        let soapClient = new Soap(easysoap, clientOptions);

        let oldDate = moment('1970-01-01');
        let diff = moment(message.message.loanDuration).diff(oldDate, 'days');

        let request = {
          loanAmount: message.message.loanAmount,
          ssn: message.message.ssn,
          loanDuration: diff,
          creditScore: message.message.creditScore
        };
        let properties = {
          replyTo: 'groupXResponse',
          headers: header
        };

        soapClient.callMethod(
          'generateQuote', {
            request: JSON.stringify(request),
            props: JSON.stringify(properties)
          }
        ).then((callResponse) => {
          console.log('generateQuote service response', callResponse);
        }).catch(err => {
          console.log(err);
        });
      }
    });
  }

}

module.exports = TranslatorJSON;