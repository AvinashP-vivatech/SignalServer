module.exports = (socket, data) => {

  console.log('In Offer');
  let dataObject = { type: 'offer', offer: data.offer }
  // console.log(socket)
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sending Offer to :', socket.toId);

  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));

}