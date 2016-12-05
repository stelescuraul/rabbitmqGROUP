'use strict';
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');

let clientOptions = {
  host: 'http://139.59.154.97:8080/',
  path: '/CreditScoreService/CreditScoreService',
  wsdl: '/CreditScoreService/CreditScoreService?wsdl',
};
let soapClient = new Soap(easysoap, clientOptions);

const amqpOptions = {
  host: '10.0.0.200'
};


class CreditScore {
  constructor() {}

  enrich(message) {
    let defer = q.defer();
    if (message && _.isObject(message)) {
      if (message.ssn && _.isString(message.ssn) && message.loanAmount && _.isNumber(message.loanAmount) && message.loanDuration && _.isDate(message.loanDuration)) {
        let exp = new RegExp('[0-9]{6}-[0-9]{4}');
        if (exp.test(message.ssn)) {

          soapClient.callMethod('creditScore', {
            ssn: message.ssn
          }).then((response) => {
            let producer = new Producer(amqp, amqpOptions);
            producer.startErrorHandler();

            let score = parseInt(response.creditScoreResponse.return);
            let ssn = message.ssn.split('-').join('');
            let loanAmount = message.loanAmount.toFixed(2);
            let loanDuration = message.loanDuration;

            let queueMessage = {
              ssn,
              score,
              loanAmount,
              loanDuration
            };
            let exchangeOptions = {
              type: 'direct',
              autoDelete: false
            };
            let messageOptions = {
              headers: {
                foo: 'bar'
              }
            };

            producer.publish('.rulesQueue', queueMessage, exchangeOptions, 'groupXexchange', messageOptions);
            defer.resolve(queueMessage);
          }).catch((err) => {
            defer.reject(err);
          });
        } else {
          console.log('ssn format wrong');
        }
      } else {
        defer.reject({
          message: 'The message content is wrong'
        });
      }
    } else {
      defer.reject({
        message: 'The message is not an object'
      });
    }
    return defer.promise;
  }

}

module.exports = CreditScore;