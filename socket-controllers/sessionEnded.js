module.exports = (socket, data) => {

  console.log('In Session Ended');
  let dataObject = { type: 'session-ended' }
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sending Session Ended to ', socket.toId)
}
