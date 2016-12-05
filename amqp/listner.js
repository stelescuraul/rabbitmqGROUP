'use strict';

const q = require('q');

class Listner {
  constructor(amqp, options) {
    this.connection = amqp.createConnection(options);
    this.options = options;
  }

  startErrorHandler() {
    this.connection.on('error', (e) => {
      console.log(`Error from amqp ${e}`);
    });
  }

  listen(queue, queueOptions, callback) {
    this.connection.on('ready', () => {

      // let exchange = this.connection.exchange(exchangeName, exchangeOptions);

      this.connection.queue(queue, queueOptions, (q) => {
        // q.bind(exchange, bindCriteria);
        // q.on('queueBindOk', () => {
        q.subscribe((message, headers, deliveryInfo, messageObject) => {
          callback(message, headers, deliveryInfo, messageObject);
        });
        // });
      });
    });
  }
}

module.exports = Listner;