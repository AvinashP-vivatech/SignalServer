module.exports = (socket, data) => {

  console.log('In Notification');
  let dataObject = { type: 'notification', message: data.message, code: data.code }
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sending Notification to ', socket.toId)
}
