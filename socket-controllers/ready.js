const sendToCDR = require('../queue/cdr_send.js');
module.exports = (socket, data) => {

  socket.join(socket.caseId);

  console.log('In Ready');
  console.log('Joined in ', socket.caseId);
  let dataObject = { type: 'ready' };
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));

  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));

  console.log('sent ready to', socket.toId)

  sendToCDR({
    'queryType': 'UPDATE',
    'type': 'video',
    'from': socket.userId,
    'to': socket.toId,
    'caseId': socket.caseId,
    'joinTime': socket.joinTime
  })
}