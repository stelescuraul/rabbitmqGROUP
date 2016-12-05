'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const parseString = require('xml2js').parseString;

let clientOptionsRuleBased = {
  host: 'http://localhost:8080/',
  path: '/RuleBaseService/RuleBaseService',
  wsdl: '/RuleBaseService/RuleBaseService?WSDL',
};

let soapClientRules = new Soap(easysoap, clientOptionsRuleBased);

const amqpOptions = {
  host: 'datdb.cphbusiness.dk'
};

const queueOptions = {
  autoDelete: false,
  durable: true
};

let exchangeOptions = {
  type: 'fanout',
  autoDelete: false
};

let listener = new Listener(amqp, amqpOptions);

let sendMessage = function (message, ssn) {
  message.ssn = ssn;
  let producer = new Producer(amqp, {
    host: '10.0.0.200'
  });
  producer.startErrorHandler();

  producer.publish('.aggregator', message, {
    type: 'direct',
    autoDelete: false
  }, 'groupXexchange', {});
};

let checkMapper = function (message, header, mapper) {
  if (mapper[message.ssn]) {
    mapper[message.ssn].messages.push({
      interestRate: message.interestRate
    });
    if (mapper[message.ssn].messages.length === mapper[message.ssn].nrOfMessages) {
      sendMessage(mapper[message.ssn], message.ssn);
      delete mapper[message.ssn];
    }
  } else {
    mapper[message.ssn] = {};
    mapper[message.ssn].nrOfMessages = header.totalNumberOfMsg;
    mapper[message.ssn].messages = [];
    mapper[message.ssn].messages.push({
      interestRate: message.interestRate
    });
    if (mapper[message.ssn].messages.length === mapper[message.ssn].nrOfMessages) {
      sendMessage(mapper[message.ssn], message.ssn);
      delete mapper[message.ssn];
    }
  }
};

class TranslatorJSON {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    let mapper = {};
    console.log('Here');
    listener.listen('groupXjsonResponse', queueOptions, (message, header, deliveryInfo, messageObject) => {
      console.log(header);
      // console.log(message,header);
      if (header.type === 'json') {
        console.log(message);
        // console.log(message);
        checkMapper(message, header, mapper);
      } else if (header.type === "xml") {
        parseString(message.data.toString('utf8'), (err, result) => {
          if (err) console.log('Error', err);
          else {
            let customMessage = {
              interestRate: parseFloat(result.LoanResponse.interestRate[0]).toFixed(1),
              ssn: parseInt(result.LoanResponse.ssn[0])
            }
            console.log(customMessage);
            checkMapper(customMessage, header, mapper);
          }
        });
      }
    });
  }

}

module.exports = TranslatorJSON;