const pino = require("pino");

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
      ignore: "pid,hostname,length",
    },
    formatters: {
      error: (err) => {
        return { type: err.type, message: err.message, stack: err.stack };
      },
    },
  },
});

module.exports = logger;
