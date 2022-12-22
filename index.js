const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logging/defaultLogger");
const errorHandler = require("./middleware/errorMiddleware");
const processenv = require("./processConfig");

const usersRoutes = require("./routes/usersRoutes");
const eventsRoutes = require("./routes/eventsRoutes");

const PORT = processenv.PORT || 5000;

const app = express();

app.use(bodyParser.json());

app.use("/users", usersRoutes);
app.use("/events", eventsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Sonal time tracker started successfuly on port ${PORT}`);
});
