'use strict';
// const amqp = require('amqp');
// const connection = amqp.createConnection({
//   host: '10.0.0.200'
// });
const q = require('q');

class Producer {
  constructor(amqp, options) {
    this.connection = amqp.createConnection(options);
    this.options = options;
  }

  startErrorHandler() {
    this.connection.on('error', (e) => {
      console.log("Error from amqp: ", e);
    });
  }

  publish(channel, message) {
    let defer = q.defer();
    this.connection.on('ready', () => {
      this.connection.publish(channel, message, (err, response) => {
        err ? defer.reject(err) : defer.resolve(response);
      });
    })
    return defer.promise;
  }
}

// connection.on('error', function (e) {
//   console.log("Error from amqp: ", e);
// });
// // add this for better debuging

// // Wait for connection to become established.
// connection.on('ready', function () {
//   // // Use the default 'amq.topic' exchange
//   // connection.queue('test',{durable:true,autoDelete:false}, function (q) {
//   // //     // Catch all messages
//   //     q.bind('#');
//   // //
//   // //     // Receive messages
//   //     // q.subscribe(function (message) {
//   //     //   // Print messages to stdout
//   //     //   console.log(message);
//   //     // });
//   // });

//   connection.publish('test', "Hello there", function (err, done) {
//     console.log('Published');
//     console.log(err, done);
//   })
// });

module.exports = Producer;