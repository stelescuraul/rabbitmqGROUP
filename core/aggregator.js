'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
let Mapper = require('../sockets/socketMapper');

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
    listener.listen('groupXAggregatorQueue', queueOptions, (message, header, deliveryInfo, messageObject) => {
      if (message && _.isObject(message)) {
        if (message.messages && message.messages[0]) {
          let min = message.messages[0].interestRate;
          _.forEach(message.messages, (obj) => {
            if (obj.interestRate < min) min = obj.interestRate;
          });
          let socketId = header.socketId;
          let socket = Mapper.getSocket(socketId);

          socket.emit('test', "The best interest rate for you is: " + min);
        }
      }
    });
  }

}

module.exports = TranslatorJSON;