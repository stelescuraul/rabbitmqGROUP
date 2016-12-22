'use strict';
const Listener = require('../amqp/listner');
const Producer = require('../amqp/producer');
const amqp = require('amqp');
const _ = require('lodash');
const q = require('q');
const parseString = require('xml2js').parseString;
let Mapper = require('../sockets/socketMapper');

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
    host: 'datdb.cphbusiness.dk'
  });
  producer.startErrorHandler();

  producer.publish('.groupXAggregator', message, {
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
        sendMessage(Mapper.getMappedObject(header.requestId), message.ssn, header);
        Mapper.deleteMappedValue(header.requestId, header);
      }
    } else {
      console.log('User disconected');
    }
  }
};

class TranslatorJSON {
  constructor() {
    listener.startErrorHandler();
  }

  listen() {
    let mapper = {};
    //groupXResponse
    listener.listen('groupXResponse', queueOptions, (message, header, deliveryInfo, messageObject) => {
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
      } else if (header.type === "xmlJSONString") {
        let msg = JSON.parse(message.data.toString('utf8'));
        let customMessage = {
          interestRate: parseFloat(parseFloat(msg.interestRate).toFixed(1)),
          ssn: parseInt(msg.ssn)
        };
        if (header.totalNumberOfMsg instanceof Array && header.totalNumberOfMsg.length === 1) {
          header.totalNumberOfMsg = header.totalNumberOfMsg[0];
        }
        checkMapper(customMessage, header, mapper);
      }
    });
  }

}

module.exports = TranslatorJSON;