const amqp = require('amqplib');
const log = require('../utils/logger');
const { amqpURI, queueName } = require('../config/cdr_amqp');
let channel;

amqp.connect(amqpURI)
  .then(connection => connection.createChannel())
  .then((channels) => {
    channel = channels;
    console.log('Channel created cdr');
    log.info(`Channel Created queue name is ${queueName}`);
    channel.assertQueue(queueName, { durable: false });
  })

async function sendToCDR(data) {
  try {
    //Sending message to consumer side 
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));
    console.log(data,` [x] Sent to CDR Queue`);
    log.info(data,` [x] Sent to CDR Queue`)
  } catch (e) {
    console.error(e);
  }
}
module.exports = sendToCDR;