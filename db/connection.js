const mysql = require("mysql2");
const processenv = require("../processConfig");

const connection = mysql.createPool({
  host: processenv.DB_HOST,
  user: processenv.DB_USER,
  password: processenv.DB_PASSWORD,
  database: processenv.DB_DATABASE,
});

module.exports = connection;
