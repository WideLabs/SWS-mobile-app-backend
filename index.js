const express = require("express");
const bodyParser = require("body-parser");
const logger = require("./logging/defaultLogger");
const errorHandler = require("./middleware/errorMiddleware");
const processenv = require("./processConfig");

const usersRoutes = require("./routes/usersRouters");
const workordersRoutes = require("./routes/workordersRoutes");

const PORT = processenv.PORT || 3000;

const app = express();

app.use(bodyParser.json());

app.use("/users", usersRoutes);
app.use("/workorders", workordersRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Sonal time tracker started successfuly on port ${PORT}`);
});
