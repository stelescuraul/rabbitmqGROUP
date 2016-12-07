'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const Soap = require('../soap/soapClient');
const easysoap = require('easysoap');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const parseString = require('xml2js').parseString;
let Mapper = require('../sockets/socketMapper');

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

let sendMessage = function (message, ssn, header) {
  message.ssn = ssn;
  let producer = new Producer(amqp, {
    host: '10.0.0.200'
  });
  producer.startErrorHandler();

  producer.publish('.aggregator', message, {
    type: 'direct',
    autoDelete: false
  }, 'groupXexchange', {
    headers: header
  });
};

let checkMapper = function (message, header, mapper) {
  let mappedRequest = Mapper.getMappedObject(header.requestId);
  if (mappedRequest && mappedRequest.nrOfMessages) {
    let messagesInMapper = mappedRequest.messages;
    if (!messagesInMapper) messagesInMapper = [];
    messagesInMapper.push({
      interestRate: message.interestRate
    });
    Mapper.setMappedValue(header.requestId, 'messages', messagesInMapper);
    if (messagesInMapper.length === mappedRequest.nrOfMessages) {
      sendMessage(mappedRequest, message.ssn, header);
      Mapper.deleteMappedValue(header.requestId);
    }
  } else {
    if (mappedRequest) {
      let messagesInMapper = [];
      messagesInMapper.push({
        interestRate: message.interestRate
      });
      Mapper.setMappedValue(header.requestId, 'nrOfMessages', header.totalNumberOfMsg);
      Mapper.setMappedValue(header.requestId, 'messages', messagesInMapper);
      if (header.totalNumberOfMsg === 1) {
        sendMessage(Mapper.getMappedObject(header.requestId), message.ssn);
        Mapper.deleteMappedValue(header.requestId, header);
      }
    } else {
      console.log('User disconected');
    }
  }
};

// let checkMapper = function (message, header, mapper) {
//   if (mapper[message.ssn]) {
//     mapper[message.ssn].messages.push({
//       interestRate: message.interestRate
//     });
//     if (mapper[message.ssn].messages.length === mapper[message.ssn].nrOfMessages) {
//       sendMessage(mapper[message.ssn], message.ssn);
//       delete mapper[message.ssn];
//     }
//   } else {
//     mapper[message.ssn] = {};
//     mapper[message.ssn].nrOfMessages = header.totalNumberOfMsg;
//     mapper[message.ssn].messages = [];
//     mapper[message.ssn].messages.push({
//       interestRate: message.interestRate
//     });
//     if (mapper[message.ssn].messages.length === mapper[message.ssn].nrOfMessages) {
//       sendMessage(mapper[message.ssn], message.ssn);
//       delete mapper[message.ssn];
//     }
//   }
// };

class TranslatorJSON {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    let mapper = {};
    listener.listen('groupXjsonResponse', queueOptions, (message, header, deliveryInfo, messageObject) => {
      // console.log("FROM NORMALIZER",header);
      if (header.type === 'json') {
        checkMapper(message, header, mapper);
      } else if (header.type === "xml") {
        parseString(message.data.toString('utf8'), (err, result) => {
          if (err) console.log('Error', err);
          else {
            let customMessage = {
              interestRate: parseFloat(parseFloat(result.LoanResponse.interestRate[0]).toFixed(1)),
              ssn: parseInt(result.LoanResponse.ssn[0])
            };
            checkMapper(customMessage, header, mapper);
          }
        });
      }
    });
  }

}

module.exports = TranslatorJSON;