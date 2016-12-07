'use strict';

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

      this.connection.queue(queue, queueOptions, (q) => {
        q.subscribe((message, headers, deliveryInfo, messageObject) => {
          callback(message, headers, deliveryInfo, messageObject);
        });
      });
    });
  }
}

module.exports = Listner;