const amqp = require('amqplib');
const db = require('../database/database');
// const moment = require('moment');
const { amqpURI, queueName } = require('../config/cdr_amqp');
const log = require('../utils/logger');
const { cdr_table } = require('../config/table');
const { query } = require('express');

amqp
  .connect(amqpURI)
  .then(connection => connection.createChannel())
  .then((channel) => {
    log.info(`[ * ] Waiting for messages in ${queueName} To exit press CTRL + C \n`);
    channel.assertQueue(queueName, { durable: false });
    
    channel.consume(queueName, (msg) => {
      let receivedMessage = JSON.parse(msg.content.toString());

      const str = JSON.stringify(receivedMessage);
      log.info(str, 'Received content')

      if (receivedMessage['caseId']) {
        if (receivedMessage['queryType'] == 'INSERT') {
          saveToDatabase(receivedMessage);
        }
        if (receivedMessage['queryType'] == 'UPDATE') {
          updateToDatabase(receivedMessage);
        }
      }
      else log.info('no caseID')
      channel.ack(msg);

    }, { noAck: false });
  })
  .catch((e) => { log.error(e) })


function saveToDatabase(message) {
  const { type, from, to, caseId, joinTime } = message;
  try{
  const query = `${message.queryType} INTO ${cdr_table}(type,from_id,to_id,case_id,join_time) values("${type}",${from},${to},${caseId},${joinTime})`
  db.query(query, (err, results) => {
    if (err) {
      log.error('Error in saved database function',err);
    } else {
      log.info(query, 'Saved into database')
    }
  })
}catch(e){
  log.error('Error in saved database function', e)
}
}

function updateToDatabase(message) {
  const { type, from, to, caseId, joinTime, leaveTime } = message;
  if (leaveTime === undefined) {
    leaveTime == "NULL";
  }
  if (type == 'video') {
    try{
    const query = `UPDATE ${cdr_table} SET type="${type}" where case_id=${caseId} && join_time=${joinTime}`;
    db.query(query, (err, results) => {
      if (err) {
        log.error('Error message found in update database function',err.message);
      } else {
        console.log('Data Saved into mh_cdr table', query);
      }
    })
  }catch(e){
    log.error('Error in update database function -', e)
  }
  } else {
    try{
    const query = `UPDATE ${cdr_table} SET leave_time=${leaveTime} where case_id=${caseId} && join_time=${joinTime} && from_id=${from}`;
    console.log(query);
    db.query(query, (err, results) => {
      if (err) {
        log.error('Error found in update database with leavtime',err.message);
      } else {
        log.info('Saved data into mh_cdr table along with leave time', query);
      }
    })
  }catch(e){
    log.error('Error found in update database with leavtime', e)
  }
  }
}
