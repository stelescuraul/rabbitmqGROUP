'use strict';
const CreditScore = require('../core/creditScore');
const Producer = require('../amqp/producer');
const amqp = require('amqp');

let creditScore = new CreditScore();
const amqpOptions = {
  host: '10.0.0.200'
};

let exchangeOptions = {
  type: 'direct',
  autoDelete: false
};

let Mapper = require('./socketMapper');

class Sockets {
  constructor(io, appToAttach) {
    this.io = io;
    this.io = io(appToAttach);
  }

  startListening() {
    let listOfSockets = [];
    this.io.on('connection', function (socket) {
      Mapper.setSocket(socket.id, socket);

      socket.on('disconnect', function () {
        console.log('a user disconnected');
        Mapper.deleteSocket(socket.id);
      });

      socket.on('test', function (msg) {
        let producer = new Producer(amqp, amqpOptions);

        producer.startErrorHandler();
        let requestId = new Date().getTime()+ '';

        producer.publish('.creditScore', msg, exchangeOptions, 'groupXexchange', {
          headers: {
            requestId: requestId,
            socketId: socket.id
          }
        });

        Mapper.setMappedValue(requestId, 'socketId', socket.id);
      });
    });
  }
}

module.exports = Sockets;