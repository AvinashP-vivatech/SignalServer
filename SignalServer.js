const fs = require('fs');
const JWT = require('jsonwebtoken');
const moment = require('moment');
const path = require('path');
const log = require ('./utils/logger.js')
// const redisClient = require('./redis.js');
const redisAdapter = require('socket.io-redis');

const sendToRabbitMQ = require('./queue/cdr_send.js');
const receiveRabbitMQ = require('./queue/cdr_receive.js');

const { URL, PORT } = require('./config/config');
const { SECRET_KEY } = require('./config/jwtkey');
const { REDIS_HOST, REDIS_PORT } = require('./config/redis');

//Video Call Handlers
const handleReady = require('./socket-controllers/ready');
const handleOffer = require('./socket-controllers/offer');
const handleCandidate = require('./socket-controllers/candidate');
const handleAnswer = require('./socket-controllers/answer');
const handleLeave = require('./socket-controllers/leave');
const handleHangUp = require('./socket-controllers/hangup');
const handleSessionEnded = require('./socket-controllers/sessionEnded');
const handleNotification = require('./socket-controllers/notification');
const handleAttachment = require('./socket-controllers/attachment');

const sendToCDR = require('./queue/cdr_send.js');
let io;
module.exports = (server) => {
  // io = require('socket.io')(server);
  io = require('socket.io', { pingInterval: 1000, pingTimeout: 5000 })(server);
  // io.set('transports', ['websocket', 'xhr-polling', 'jsonp-polling']);
  //io.set('heartbeat timeout', 1000);
  //io.set('heartbeat interval', 1000);
  io.adapter(redisAdapter({ host: REDIS_HOST, port: REDIS_PORT, detect_buffers: true }));

  io.on('connection', (socket) => {
    console.log(`Connected with ${socket.id} at ${socket.handshake.address}`);
    log.info(`Connection established connected with ${socket.id} at ${socket.handshake.address}`);

    socket.on('event', (message) => {
      const data = message;

      switch (data.type) {
        case 'login':
          handleLogin(socket, data);
          break;

        case 'message':
          handleMessage(socket, data);
          break;

          //VIDEO CALL STARTS HERE
        case 'ready':
          handleReady(socket, data);
          break;

        case 'offer':
          handleOffer(socket, data);
          break;

        case 'answer':
          handleAnswer(socket, data);
          break;

        case 'candidate':
          handleCandidate(socket, data);
          break;

        case 'leave':
          handleLeave(socket, data);
          break;

        case 'session-ended':
          handleSessionEnded(socket, data);
          break;

        case 'notification':
          handleNotification(socket, data);
          break;

        case 'hangup':
          handleHangUp(socket, data);
          break;

        case 'attachment':
          handleAttachment(socket, data);
          break;

        default:
          handleDefault(socket, data);
          break;
      }
    });

    socket.on('disconnect', () => {
      if (socket.toId) {
        socket.to(socket.toId).emit('event', JSON.stringify({ type: 'leave' }));
        console.log(`SocketID:${socket.id} disconnected`);
        log.info(`SocketID:${socket.id} disconnected`)
        sendToCDR({
          'queryType': 'UPDATE',
          'from': socket.userId,
          'to': socket.toId,
          'caseId': socket.caseId,
          'joinTime': socket.joinTime,
          'leaveTime': Math.ceil(moment().utc().valueOf() / 1000)
        })
      }
    });
  }).on('error', (error) => {
    log.error('socket connection error messages-',error);
    console.log(error)
  });
};

async function handleMessage(socket, messageObject) {
  try {
    let { caseStartTime, caseEndTime } = socket;
    let currentTime = Math.ceil(moment().utc().valueOf() / 1000);
    let { message } = messageObject;
    let roomid = socket.caseId;
    let fileData = messageObject.file;
    messageObject.timeStamp = currentTime;

    //Validations
    if (caseStartTime > currentTime || currentTime > caseEndTime) {
      log.error('Session is not valid- Handle message function')
      throw new Error('Session is not valid');
    }

    if ((!message || typeof message !== 'string') && !fileData) {
      log.error('Message should be not empty string- Handle message function')
      throw new Error('Message should be not empty string');
    }

    if (!fileData || fileData.constructor !== Object) {
      log.error('Added to Check If fileData is in Object- Handle message function')
      throw new Error('Added to Check If fileData is in Object');
    }

    if (Object.keys(fileData).length !== 3 && Object.keys(fileData).length !== 0) {
      log.error('Expecting object with length of 3- Handle message function')
      throw new Error('Expecting object with length of 3');
    }

    if (Object.keys(fileData).length === 3) {
      messageObject.file = await handleFileUpload(fileData);
      log.info('File Handle Sucessfull- Handle message function');
    }

    socket.broadcast.to(socket.toId).emit('event', JSON.stringify(messageObject));
    log.info('\nSending to Room ', roomid);

    messageObject.from = socket.userId;
    messageObject.to = socket.toId;
    messageObject.caseId = socket.caseId;

    sendToRabbitMQ(messageObject);
  } catch (e) {
    log.error(e, 'handle message error- Handle message function');
    socket.emit('event', JSON.stringify({ type: 'error', code: 403 }));
  }
}

function handleLogin(socket, data) {
  try {
    let decoded = data;
    log.info(`Socket -- handle login function ${socket}`)
    log.info(`data-- Handle login function ${data}`)
    if (io.sockets.adapter.rooms[decoded.userId]) {
      log.error('Either call is already connected or network problem occurred. Please try again.')
      throw new Error('Either call is already connected or network problem occurred. Please try again.')
    }
    let currentTime = Math.ceil(moment().utc().valueOf() / 1000);

    //Validations
    if (decoded.caseStartTime > currentTime || currentTime > decoded.caseEndTime) {
      log.error('Session is not valid- Handle login function')
      throw new Error('Session is not valid');
    }

    socket.join(decoded.userId);

    socket.emit('event', JSON.stringify({ type: 'login', success: true }));
    let timeout = decoded.caseEndTime - currentTime;
    setTimeout(() => {
      log.info('Sent Leave Event from Timeout- Handle login function');
      //socket.emit('event', { type: 'leave' });
      socket.emit('event', JSON.stringify({type:'session-ended'}))
      socket = null;
    }, timeout * 1000)

    log.info('Handle login function -Setted timeout of', timeout);

    Object.assign(socket, decoded);

    socket.joinTime = currentTime;

    sendToCDR({
      'queryType': 'INSERT',
      'type': 'chat',
      'from': socket.userId,
      'to': socket.toId,
      'caseId': socket.caseId,
      'joinTime': socket.joinTime
    })

  } catch (e) {
    log.error(`Handle login function - Failed to Verify ${e.message}`);
    socket.emit('event', JSON.stringify({ type: 'login', success: false, message: e.message }));
  }
}

function handleDefault(socket, data) {
  log.error('Handle default function call - Invalid JSON or Command not found' )
  socket.emit('event', JSON.stringify({ type: 'error', message: 'Invalid JSON or Command not found' }));
}

function handleFileUpload(fileData) {
  return new Promise((resolve, reject) => {
    let { name, type, file } = fileData;

    //This Will remove spaces from file name and convert it into underscores
    // name = name.replace(/ /g, "_");
    name = name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();

    //This will strip application/whatever from base64
    let dataString = file.split('base64,')[1];

    //Added this for Android Support
    if (dataString === undefined) {
      dataString = file;
    }

    let bufferData = new Buffer.from(dataString, 'base64');
    let fileName = `${Math.ceil(moment().utc().valueOf() / 1000)}${name}`;
    let path = `public/uploads/${fileName}`;

    fs.writeFileSync(path, bufferData);

    fileData = {};
    fileData.type = type;
    /** https is for secure connection in server and http for local/development */
    fileData.url = `https://${URL}:${PORT}/public/uploads/${fileName}`;
    // fileData.url = `http://${URL}:${PORT}/public/uploads/${fileName}`;

    if (type != 'pdf') {
      type = 'image';
    }
    resolve(fileData);
  });
}
