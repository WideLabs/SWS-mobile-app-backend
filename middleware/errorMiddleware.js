const logger = require("../logging/defaultLogger");
const httpStatusCodes = require("../utils/httpStatusCodes");

const errorHandler = (err, req, res, next) => {
  logger.error(err);

  const statusCode = res.statusCode
    ? res.statusCode
    : httpStatusCodes.SERVER_ERROR;

  return res.status(statusCode).json({
    message: err.message,
  });
};

module.exports = errorHandler;
