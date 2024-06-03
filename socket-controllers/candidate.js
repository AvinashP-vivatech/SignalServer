module.exports = (socket, data) => {

  console.log('In Candidate');
  let dataObject = { type: 'candidate', candidate: data.candidate };
  // socket.to(socket.caseId).emit('candidate', JSON.stringify(dataObject));
  socket.to(socket.toId).emit('event', JSON.stringify(dataObject));
  console.log('Sending Candidate to ', socket.toId);
}
