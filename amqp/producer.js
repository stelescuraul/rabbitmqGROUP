'use strict';

const q = require('q');

class Producer {
  constructor(amqp, options) {
    this.connection = amqp.createConnection(options);
    this.options = options;
  }

  startErrorHandler() {
    this.connection.on('error', (e) => {
      console.log(`Error from amqp:  ${e}`);
    });
  }

  publish(channel, message, exchangeOptions, exchangeName, queueName, queueOptions, bindCriteria, publishOptions) {
    this.connection.on('ready', () => {
      let exchange = this.connection.exchange(exchangeName, exchangeOptions);

      let self = this;
      this.connection.queue(queueName, queueOptions, (q) => {
        q.bind(exchange, bindCriteria);
        q.on('queueBindOk', () => {
          exchange.publish(channel, message, publishOptions);
        });
      });
    });
  }
}

module.exports = Producer;