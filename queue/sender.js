const amqp = require('amqplib');
const { amqpURI, queueName } = require('../config/amqp');
let channel;

amqp.connect(amqpURI)
  .then(connection => connection.createChannel())
  .then((channels) => {

    channel = channels;
    console.log('Channel created');
    channel.assertQueue(queueName, { durable: false });
  })

async function sender(data) {
  try {

    console.log("Sending data to QUEUE: ", data);
    //Sending message to consumer side 
    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(data)));

    console.log(` [x] Sent to Queue`);

  } catch (e) {
    console.error(e);
  }
}
module.exports = sender;