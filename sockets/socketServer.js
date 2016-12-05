'use strict';
const CreditScore = require('../core/creditScore');
const Producer = require('../amqp/producer');
const amqp = require('amqp');

let creditScore = new CreditScore();
const amqpOptions = {
  host: '10.0.0.200'
};

// let producer = new Producer(amqp, amqpOptions);
// producer.startErrorHandler();
// let listOfSockets = [];
class Sockets {
  constructor(io, appToAttach) {
    this.io = io;
    this.io = io(appToAttach);
  }

  startListening() {
    // let self = this;
    let listOfSockets = [];
    this.io.on('connection', function (socket) {
      console.log('a user connected');
      listOfSockets.push(socket.id);
      // socket.emit('',"Hello");
      socket.emit('test', 'Hello from the server :)');

      socket.on('disconnect', function () {
        console.log('user disconnected');
      });

      socket.on('test', function (msg) {
        console.log(`my message is ${msg}`);
        // io.emit('test', msg);

        // Check the message here
        // Send the message to the queue so that the creditScore will listen to it

        socket.emit('test', msg);
      });

      socket.on('getQuote', function (msg) {
        console.log(`Received a new quote`);
        creditScore.enrich(msg);
      });

      socket.on('specific_to_someone', function (id, msg) {
        console.log(id, msg);
        socket.broadcast.to(id).emit('test', msg);
      });

      // socket.emit('hi', 'everyone');
    });
  }
}

module.exports = Sockets;