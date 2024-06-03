module.exports = (socket, data) => {

  let dataObject = { type: 'attachment', message: { url: data.message.url, type: data.message.file_type, timeStamp: data.message.timeStamp } };
  console.log('Sending attachment', dataObject)
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));

}