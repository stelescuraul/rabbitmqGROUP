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

  publish(routingKey, message, exchangeOptions, exchangeName, messageOptions) {
    this.connection.on('ready', () => {
      this.connection.exchange(exchangeName, exchangeOptions, (exchange) => {
        exchange.publish(routingKey, message, messageOptions);
      });
    });
  }

  setup(routingKey, exchangeOptions, exchangeName, queueName, queueOptions) {
    let defer = q.defer();
    this.connection.on('ready', () => {
      this.connection.exchange(exchangeName, exchangeOptions, (exchange) => {
        this.connection.queue(queueName, queueOptions, (q) => {
          q.bind(exchange, routingKey);
          q.on('queueBindOk', () => {
            console.log('Queue created');
            defer.resolve();
          });
        });
      });
    });
    return defer.promise;
  }
}

module.exports = Producer;