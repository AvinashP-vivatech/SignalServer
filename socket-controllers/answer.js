module.exports = (socket, data) => {

  console.log('In Answer');
  let dataObject = { type: 'answer', answer: data.answer };
  // socket.to(socket.caseId).emit('event', JSON.stringify(dataObject));
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sended answer to ', socket.toId);

}