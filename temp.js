const fs = require('fs')
const pathed = __dirname + '/config/ssl.js';
if (fs.existsSync(pathed)) {
  console.log('Exists')
} else {
  console.log('Created at ', pathed)
  let datas = `const fs = require('fs');
module.exports = {
  KEY: fs.readFileSync('./credentials/key.pem'),
  CERT: fs.readFileSync('./credentials/cert.pem')
}`
  fs.writeFileSync(pathed, datas, { flag: 'wx' });
}