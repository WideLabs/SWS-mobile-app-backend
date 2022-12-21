const db = require("../db");

// Set status to inProgress
// Set timestamp started
const startTimer = (req, res, next) => {
  const { id_work_order, id_work_column, takt, start_time } = req.body;

  db.query(
    "INSERT INTO work_orders (id_work_order,id_work_column,takt,start_time,status) VALUES (?,?,?,CURRENT_TIMESTAMP,'progress')",
    [id_work_order, id_work_column, takt, start_time],
    (error, results, fields) => {
      if (error) return next(error);

      return res.status(200).json({ message: "started" });
    }
  );
};

// Set status to finished
// Set timestamp ended
// Set timestamp duration
const endTimer = (req, res, next) => {
  return res.status(200);
};

// Return status of workorder by id
const getStatus = (req, res, next) => {
  const { id_work_column, takt } = req.query;
  db.query(
    "SELECT status,start_time,end_time FROM work_orders WHERE id_work_column = ? AND takt = ? ",
    [id_work_column, takt],
    (error, results, fields) => {
      if (error) {
        return next(error);
      }
      if (results.length < 1) {
        return res.status(404).json({
          message: `Workorder not found or started by id: {${id_work_column}}.`,
        });
      }
      return res.status(200).json(results);
    }
  );
};

module.exports = {
  startTimer,
  endTimer,
  getStatus,
};
