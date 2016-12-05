'use strict';
const CreditScore = require('../core/creditScore');

let creditScore = new CreditScore();
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