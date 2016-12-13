'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const xml2js = require('xml2js');
const moment = require('moment');
const builder = new xml2js.Builder();

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
    listener.listen('groupXTranslatorXMLQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        let oldDate = moment(message.message.loanDuration);
        // date type for xml ... kill me
        //'1972-01-01 01:00:00.0 CET'
        let messageToSend = {
          LoanRequest: {
            ssn: message.message.ssn,
            creditScore: message.message.creditScore,
            loanAmount: message.message.loanAmount,
            loanDuration: oldDate.format('YYYY-MM-DD')
          }
        };

        let xmlMessage = builder.buildObject(messageToSend);
        let producer = new Producer(amqp, {
          host: message.recipient.host
        });

        producer.startErrorHandler();
        producer.publish('*', xmlMessage, exchangeOptions, message.recipient.exchange, {
          replyTo: 'groupXResponse',
          headers: header
        });
      }
    });
  }
}

module.exports = TranslatorJSON;