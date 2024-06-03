const formidable = require('formidable');
const JWT = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const SECRET_KEY = process.env.JWT_KEY;
const URL = process.env.CDN_URL;
const PORT = process.env.CDN_PORT;
const attachment_table = process.env.Attachment_TABLE

const db = require('../database/database');
module.exports = async (req, res) => {
  const form = new formidable.IncomingForm();
  res.header('Access-Control-Allow-Origin', '*');
  try {
    const [url, type, timeStamp, orignalFilename] = await handleForm(form, req)
    // const datasd = await handleForm(form, req)
    // console.log(datasd)
    if (!type) throw new Error('Type is not attached');
    if (!url) throw new Error('File is not attached');
    console.log('Sent by API', { url, timeStamp, orignalFilename })
    res.json({ "status": 200, message: "File Uploaded Successfully", data: { url, type, timeStamp, fileName: orignalFilename } })

  } catch (e) {
    console.log(e.message)
    res.json({ "status": 400 })
  }
}

function handleForm(form, req) {
  return new Promise((resolve, reject) => {
    let orignalFilename, token, decoded, url, type, counter = 0;
    form.parse(req)

    form.on('field', (name, field) => {
      counter += 1;
      console.log('Field received', field, 'is Field');
      if (counter == 1) {
        try {
          token = field
          decoded = JWT.verify(token, SECRET_KEY)
          console.log('Decoded data is', decoded);
          let currentTime = Math.ceil(moment().utc().valueOf() / 1000);
          if (decoded.caseStartTime > currentTime && currentTime > decoded.caseEndTime) {
            console.log('Session is not valid')
            throw new Error('Session is not valid');
          }
        } catch (e) {
          reject(e)
        }
      }
      if (counter == 2) {

        type = field;

      }
    });
    form.on('fileBegin', (name, file) => {
      try {
        console.log('File received');

        let currentDirectory = path.resolve(__dirname, '..');
        let paths = '/public/attach/' + decoded.caseId + '/';
        let currentTime = Math.ceil(moment().utc().valueOf() / 1000);
        file.name = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        //file.name = file.name.replace(/ /g, "_");
        orignalFilename = file.name;

        let fileName = paths + currentTime + '_' + file.name;
        // if (fileName.endsWith('pdf')) {
        //   type = "pdf"
        // } else {
        //   type = "image"
        // }

        if (!decoded) {
          throw new Error('No token found')
        }

        if (!fs.existsSync(currentDirectory + paths)) {
          fs.mkdirSync(currentDirectory + paths)
        }

        file.path = currentDirectory + fileName
        url = `https://${URL}` + fileName;

      } catch (e) {
        console.log(e)
        reject(e)
      }

    })
    form.on('file', function(name, file) {
      let timeStamp = Math.ceil(moment().utc().valueOf() / 1000);
      saveToDatabase(decoded, url, type, timeStamp, orignalFilename);
      resolve([url, type, timeStamp, orignalFilename]);
    });
    form.on('error', () => {
      reject()
    })
    form.on('end', () => {
      resolve()
    })
  })
}

function saveToDatabase(decoded, url, type, timeStamp, orignalFilename) {


  let query = `INSERT INTO ${attachment_table} (case_id,from_id,to_id,url,file_type,created_at,file_name) values(${decoded.caseId},${decoded.userId},${decoded.toId},"${url}","${type}",${timeStamp},"${orignalFilename}")`;
  db.query(query, (err, results) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Saved');
    }
  })
}