let socket = io({ transports: ['websocket'] });
socket.on('connect', (data) => {
  console.log('Connect to signal');
  let token = "";
  let loginData = { type: "login", token };
  socket.emit('event', JSON.stringify(loginData));
});
socket.on('event', (data) => {
  console.log(data, "Y");
})
socket.on('message', (data) => {
  console.log(data, "X");
})