module.exports = (socket, data) => {

  console.log('In Leave');
  let dataObject = { type: 'leave' }
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));
  if(socket.toId){
    socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  }
  console.log('Sending leave to ', socket.toId)
}
