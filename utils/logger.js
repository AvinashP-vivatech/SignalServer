'use strict';
const { createLogger, format, transports } = require('winston');
require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// const env = process.env.NODE_ENV || 'development';
// const logDir = 'logs';

// const ensureLogsDirectoryExists = () => {
//   const logsDir = path.resolve(__dirname, 'logses');
//   if (!fs.existsSync(logsDir)) {
//     fs.mkdirSync(logsDir);
//   }
// };

// // Ensure logs directory exists
// ensureLogsDirectoryExists();

const { combine, timestamp, printf } = format;

const logger = createLogger({
  level: 'info',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    printf(env => `${env.timestamp} ${env.level}: ${env.message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: path.join(__dirname,'..', 'logs', 'logfiles.log') }),
  
    /** for scheduler on defined interval */
    // new transports.DailyRotateFile({
    //   filename: 'logs/%DATE%.log',
    //   datePattern: 'YYYY-MM-DD',
    //   zippedArchive: true,
    //   maxSize: '20m',
    //   maxFiles: '14d'
    // })
  ]
});

module.exports = logger;