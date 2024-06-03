require('dotenv').config()
const express = require('express');
const fs = require('fs');
// const http = require('http'); // for development local
const http = require('https'); // for server because ssl is added in server so its secure
const path = require('path');
const app = express();

const { URL, PORT } = require('./config/config');

/* ***** comment out below lines to use in local / development ***** */ 
const { KEY, CERT } = require('./config/ssl');
const options = { key: KEY, cert: CERT };
const httpsServer = http.createServer(options, app);

/* ***** comment out below lines to use in server ***** */ 
// const httpsServer = http.createServer(app);

const signalServer = require('./SignalServer')(httpsServer);

const fileUploadController = require('./controllers/fileupload.js');

httpsServer.listen(PORT, () => {
  console.log(`Listening on Server ${PORT}`);
});

app.use('/public', express.static(__dirname + '/public'));
app.get('/image/:id', (req, res) => {
  console.log('Image');
  console.log(req.headers);
  res.sendFile(path.resolve('public/uploads/' + req.params.id))
})
app.get('/', (req, res) => {
  res.sendFile(path.resolve('test.html'));
});

app.post('/file', fileUploadController);