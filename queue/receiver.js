// const amqp = require('amqplib');
// const db = require('../database/database');
// // const moment = require('moment');
// const { amqpURI, queueName } = require('../config/amqp');

// amqp
//   .connect(amqpURI)
//   .then(connection => connection.createChannel())
//   .then((channel) => {
//     console.log(`[ * ] Waiting for messages in ${queueName} To exit press CTRL + C \n`);
//     channel.assertQueue(queueName, { durable: false });
//     console.log(queueName)
    
//     channel.consume(queueName, (msg) => {

//       let receivedMessage = JSON.parse(msg.content.toString());
//       console.log(' [x] Received ');
//       console.log(receivedMessage);
//       saveToDatabase(receivedMessage);
//       channel.ack(msg);

//     }, { noAck: false });
//   })
//   .catch((e) => { console.log(e) })

// function saveToDatabase(receivedMessage) {
//   try {
//     let { from, to, message, caseId, file, queryType} = receivedMessage;
//     let url = '';
//     let type = '';
//     const { DateTime } = require('luxon');
//     const timeStamp = DateTime.now().toMillis();

//     console.log('receivedMessage from queue', receivedMessage)

//     // if user is sending files
//     if (file && file?.constructor === Object && Object.entries(file).length === 2) {
//       url = file.url;
//       type = file.type;
//     }

//     // if user is sending message 
//     if(message) {
//       message = message.replace(/\\/g, '\\\\');
//       message = message.replace(/\"/g, '\\\"');
//     }
      
//     let query = `INSERT INTO mh_chat(case_id,from_id,to_id,message,url,url_type,created_at) values(${caseId},${from},${to},"${message ? message : ''}","${url}","${type}",${timeStamp})`;

//     db.query(query, (err, results) => {
//       if (err) {
//         console.log(err.message);
//       } else {
//         console.log('DB updated');
//         console.log('Query :: ', query)

//       }
//     })
//   } catch (e) {
//     console.log(e);
//   }
// }