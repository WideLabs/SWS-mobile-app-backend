const logger = require("../logging/defaultLogger");

const errorHandler = (err, req, res, next) => {
  console.log("NEKIII");
  logger.error(err);

  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);
  return res.status(statusCode).json({
    message: err.message,
  });
};

module.exports = errorHandler;
