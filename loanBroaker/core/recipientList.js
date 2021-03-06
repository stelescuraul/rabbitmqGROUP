'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
let SocketMapper = require('../sockets/socketMapper');

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

const bankslist = {
  'cphbusiness.bankService': {
    host: 'http://localhost:8080/',
    type: 'xmlJSONString',
    exchange: 'cphbusiness.bankService',
    translator: '.groupXServiceXML'
  },
  'cphbusiness.bankRabbit': {
    host: 'datdb.cphbusiness.dk',
    type: 'xmlJSONString',
    exchange: '',
    translator: '.groupXTranslatorJSONBank'
  },
  'cphbusiness.bankXML': {
    host: 'datdb.cphbusiness.dk',
    type: 'xml',
    exchange: 'cphbusiness.bankXML',
    translator: '.groupXTranslatorXML'
  },
  'cphbusiness.bankJSON': {
    host: 'datdb.cphbusiness.dk',
    type: 'json',
    exchange: 'cphbusiness.bankJSON',
    translator: '.groupXTranslatorJSON'
  }
};

class RecipientList {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    listener.listen('groupXRecipientQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
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

            let headers = {
              totalNumberOfMsg: count,
              type: recipient.type
            };
            _.forEach(header, (value, key) => {
              headers[key] = value;
            });

            producer.publish(recipient.translator, messageToSend, exchangeOptions, 'groupXexchange', {
              headers: headers
            });
          });
        } else {
          let socketId = header.socketId;
          let socket = SocketMapper.getSocket(socketId);

          socket.emit('test', "Credit score too low to send to any banks: " + message.message.creditScore);
        }
      }
    });
  }

}

module.exports = RecipientList;