'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const moment = require('moment');

const amqpOptions = {
  host: 'datdb.cphbusiness.dk'
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

class TranslatorJSON {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('groupXTranslatorJSONBankQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        let oldDate = moment('1970-01-01');
        let diff = moment(message.message.loanDuration).diff(oldDate,'days');
        let messageToSend = {
          ssn: message.message.ssn,
          creditScore: message.message.creditScore,
          loanAmount: message.message.loanAmount,
          loanDuration: diff
        };

        let producer = new Producer(amqp, {
          host: message.recipient.host
        });

        producer.startErrorHandler();
        producer.publish('groupXJSONBank', messageToSend, exchangeOptions, message.recipient.exchange, {
          replyTo: 'groupXResponse',
          headers: header
        });
      }
    });
  }

}

module.exports = TranslatorJSON;