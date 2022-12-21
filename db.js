const logger = require("./logging/defaultLogger");
const mysql = require("mysql2");
const processenv = require("./processConfig");

const db = mysql.createConnection({
  host: processenv.DB_HOST,
  user: processenv.DB_USER,
  password: processenv.DB_PASSWORD,
  database: processenv.DB_DATABASE,
});

db.connect(function (error) {
  if (error) {
    logger.error(`Database connection failed. ${error}`);
    process.exit(1);
  } else {
    logger.info("Database connected.");
  }
});

module.exports = db;
