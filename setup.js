const amqp = require('amqp');
const q = require('q');

let Producer = require('./amqp/producer');
let producer = new Producer(amqp, {
  host: '10.0.0.200'
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
promises.push(producer.setup(".creditScore", exchangeOptions, exchangeName, 'creditScoreQueue', queueOptions));
promises.push(producer.setup(".recipientList", exchangeOptions, exchangeName, 'recipientQueue', queueOptions));
promises.push(producer.setup(".rules", exchangeOptions, exchangeName, 'rulesQueue', queueOptions));
promises.push(producer.setup(".translatorJSON", exchangeOptions, exchangeName, 'translatorJSONQueue', queueOptions));
promises.push(producer.setup(".translatorXML", exchangeOptions, exchangeName, 'translatorXMLQueue', queueOptions));
promises.push(producer.setup(".aggregator", exchangeOptions, exchangeName, 'aggregatorQueue', queueOptions));

q.all(promises).then(()=>{
  console.log('all queues created');
  process.exit(0);
}).catch(() =>{
  console.log('error creating queues');
  process.exit(0);
});