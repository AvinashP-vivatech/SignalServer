const fs = require('fs');
module.exports = {
  //KEY: fs.readFileSync('./credentials/key.pem'),
  //KEY: fs.readFileSync('/etc/ssl/private/cert2.key'),
  KEY: fs.readFileSync('/etc/ssl/signalling.key'),
  //CERT: fs.readFileSync('./credentials/cert.pem')
  //CERT: fs.readFileSync('/etc/ssl/certs/cert2.crt'),
  CERT: fs.readFileSync('/etc/ssl/signalling.crt'),
  //CA : fs.readFileSync('/etc/ssl/ssl.crt/mhealth_telesom_com.ca-bundle')
}
