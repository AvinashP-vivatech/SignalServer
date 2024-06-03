const fs = require('fs');
module.exports = {
  
  KEY: fs.readFileSync('/etc/ssl/signalling.key'),
 
  CERT: fs.readFileSync('/etc/ssl/signalling.crt'),
  //CA : fs.readFileSync('/etc/ssl/ssl.crt/mhealth_telesom_com.ca-bundle')
}
