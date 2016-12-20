const amqp = require('amqp');
const q = require('q');

let Producer = require('./amqp/producer');
let producer = new Producer(amqp, {
  host: 'datdb.cphbusiness.dk'
  // host: '10.0.0.200'
});
let channel = "directChannel";
let exchangeOptions = {
  type: 'direct',
  autoDelete: false
};
let exchangeName = "groupXexchange";
let queueName = "directQueue";
let queueOptions = {
  autoDelete: false,
  durable: true
};
let bindCriteria = '*';

producer.startErrorHandler();
let promises = [];
promises.push(producer.setup(".groupXCreditScore", exchangeOptions, exchangeName, 'groupXCreditScoreQueue', queueOptions));
promises.push(producer.setup(".groupXRecipientList", exchangeOptions, exchangeName, 'groupXRecipientQueue', queueOptions));
promises.push(producer.setup(".groupXRules", exchangeOptions, exchangeName, 'groupXRulesQueue', queueOptions));
promises.push(producer.setup(".groupXTranslatorJSON", exchangeOptions, exchangeName, 'groupXTranslatorJSONQueue', queueOptions));
promises.push(producer.setup(".groupXServiceXML", exchangeOptions, exchangeName, 'groupXServiceXMLQueue', queueOptions));
promises.push(producer.setup(".groupXTranslatorXML", exchangeOptions, exchangeName, 'groupXTranslatorXMLQueue', queueOptions));
promises.push(producer.setup(".groupXAggregator", exchangeOptions, exchangeName, 'groupXAggregatorQueue', queueOptions));

q.all(promises).then(()=>{
  console.log('all queues created');
  process.exit(0);
}).catch(() =>{
  console.log('error creating queues');
  process.exit(0);
});