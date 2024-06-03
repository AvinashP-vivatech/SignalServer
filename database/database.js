const mysql = require("mysql");
const settings = require("../config/database");
let db;

//Connection Pool
let pool = mysql.createPool(settings);
module.exports = pool;