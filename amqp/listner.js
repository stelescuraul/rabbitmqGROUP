'use strict';
const amqp = require('amqp');
const connection = amqp.createConnection({
  host: '10.0.0.200'
});

// add this for better debuging
connection.on('error', function (e) {
  console.log("Error from amqp: ", e);
});

// Wait for connection to become established.
connection.on('ready', function () {
  console.log('test??');
  // Use the default 'amq.topic' exchange
  connection.queue('test', {
    durable: true,
    autoDelete: false
  }, function (q) {
    // Catch all messages
    q.bind('#');
    console.log('subscribed to queue');
    // Receive messages
    q.subscribe(function (message) {
      // Print messages to stdout
      console.log(message.data.toString('utf8'));
    });
  });
});

module.exports = {};