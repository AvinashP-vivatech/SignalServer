module.exports = (socket, data) => {

  console.log('In Hangup');
  let dataObject = { type: 'hangup' }
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sending hangup to ', socket.toId)
}
