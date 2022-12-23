const moment = require("moment");
const db = require("../db");
const httpStatusCodes = require("../utils/httpStatusCodes");

// Route GET /events
// Desc Returns all event in db
const getEvents = (req, res, next) => {
  db.query("SELECT * FROM timed_event", (error, results) => {
    if (error) return next(error);
    return res.status(httpStatusCodes.OK).json(results);
  });
};

// Route GET /events/:id
// Desc Return event with specified id
const getEventById = (req, res, next) => {
  const { id } = req.params;
  db.query(
    "SELECT * FROM timed_event WHERE id_timed_event = ?;",
    [id],
    (error, results) => {
      if (error) return next(error);
      if (results.length < 1)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .json({ message: `Timed_event not found by id: {${id}}` });

      return res.status(httpStatusCodes.OK).json(results);
    }
  );
};

// Route GET /events/all
// Desc Returns all event specified with query params (atleast one param must be provided)
// Params id_work_order, id_column_order, id_takt
const getEventsByQueryParams = (req, res, next) => {
  const { id_work_order, id_column_order, id_takt } = req.query;
  // Check if atleast on query param is provided
  if (!id_work_order && !id_column_order && !id_takt)
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Missing query parameters. Atleast one param must be provided.",
    });

  const params = { id_work_order, id_column_order, id_takt };
  // Filter out undefined (not provided) params
  let paramsQueryStrings = [];
  let paramsQueryValues = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      paramsQueryStrings.push(key + " = ?");
      paramsQueryValues.push(value);
    }
  }
  const query = `SELECT * FROM timed_event WHERE ${paramsQueryStrings.join(
    " AND "
  )};`;
  db.query(query, paramsQueryValues, (error, results) => {
    if (error) return next(error);
    if (results.length > 0) {
      results = results.map(({ time, ...rest }) => {
        return { ...rest, time: moment(time).format("YYYY-MM-DD HH:mm:ss") };
      });
    }
    return res.status(httpStatusCodes.OK).json(results);
  });
};

// Route GET /events/recent
// Desc Returns the most recent event specified with query params (atleast one param must be provided)
// Params id_work_order, id_column_order, id_takt
const getMostRecentEventByQueryParams = (req, res, next) => {
  const { id_work_order, id_column_order, id_takt } = req.query;
  // Check if atleast on query param is provided
  if (!id_work_order && !id_column_order && !id_takt)
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Missing query parameters. Atleast one param must be provided.",
    });

  const params = { id_work_order, id_column_order, id_takt };
  // Filter out undefined (not provided) params
  let paramsQueryStrings = [];
  let paramsQueryValues = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      paramsQueryStrings.push(key + " = ?");
      paramsQueryValues.push(value);
    }
  }
  const query = `SELECT * FROM timed_event WHERE ${paramsQueryStrings.join(
    " AND "
  )} ORDER BY time DESC;`;
  db.query(query, paramsQueryValues, (error, results) => {
    if (error) return next(error);
    if (results.length > 0) {
      const timeFormated = moment(results[0].time).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      results[0].time = timeFormated;
    }
    return res.status(httpStatusCodes.OK).json(results[0]);
  });
};

// Route GET /events/all/time
// Desc Calc elapsed time of results
const getElapsedTimeOfEventsWithQueryParams = (req, res, next) => {
  const { id_work_order, id_column_order, id_takt } = req.query;
  if (!id_work_order || !id_column_order || !id_takt)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Missing query parameters. All params required." });

  const params = { id_work_order, id_column_order, id_takt };
  // Filter out undefined (not provided) params
  let paramsQueryStrings = [];
  let paramsQueryValues = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      paramsQueryStrings.push(key + " = ?");
      paramsQueryValues.push(value);
    }
  }
  const query = `SELECT * FROM timed_event WHERE ${paramsQueryStrings.join(
    " AND "
  )};`;
  db.query(query, paramsQueryValues, (error, results) => {
    if (error) return next(error);
    if (results.length < 2) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "Not enough results." });
    }

    let totalElapsedTime = {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    for (let i = 0; i < results.length - 1; i++) {
      const element1 = results[i];
      if (element1.action.toLowerCase() === "finish") break;
      if (element1.action.toLowerCase() === "pause") continue;
      const element2 = results[i + 1];
      const elapsedTime = moment.duration(
        moment(element2.time, "YYYY-MM-DD HH:mm:ss").diff(
          moment(element1.time, "YYYY-MM-DD HH:mm:ss")
        )
      );
      totalElapsedTime.hours += elapsedTime.hours();
      totalElapsedTime.minutes += elapsedTime.minutes();
      totalElapsedTime.seconds += elapsedTime.seconds();
    }

    const totalElapsedTimeStr = [
      totalElapsedTime.hours,
      totalElapsedTime.minutes,
      totalElapsedTime.seconds,
    ]
      .map((val) => {
        return val < 10 ? "0".concat(val.toString()) : val.toString();
      })
      .join(":");

    return res
      .status(httpStatusCodes.OK)
      .json({ results, totalElapsedTime, totalElapsedTimeStr });
  });
};

// Route GET /events/status
// Desc Returns the status specified with query params (all params must be provided)
// Params id_column_order, id_takt
const getStatusOfTaskByQueryParams = (req, res, next) => {
  const { id_column_order, id_takt } = req.query;
  // Check if atleast one query param is provided
  if (!id_column_order || !id_takt)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Missing query parameters. All params required." });

  const statusMap = {
    start: "inProgress",
    pause: "paused",
    finish: "finished",
  };

  // TODO return also who is working on it?
  db.query(
    `SELECT action
      FROM timed_event 
      WHERE id_column_order = ? AND id_takt = ? 
      ORDER BY time DESC;`,
    [id_column_order, id_takt],
    (error, results) => {
      if (error) return next(error);
      if (results.length < 1) {
        return res.status(httpStatusCodes.OK).json({ status: "none" });
      }

      return res.status(httpStatusCodes.OK).json({
        status: statusMap[results[0].action.toLowerCase()],
      });
    }
  );
};

// Route POST /events
// Desc Adds new event based on values provided in request body
const addEvent = (req, res, next) => {
  const { id_work_order, id_column_order, id_takt, action, id_mobile_user } =
    req.body;

  if (
    !id_work_order ||
    !id_column_order ||
    !id_takt ||
    !action ||
    !id_mobile_user
  ) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Bad request. Missing properties in body." });
  }

  if (!["start", "pause", "finish"].includes(action.toLowerCase())) {
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Bad request. Invalid action." });
  }

  // Retrieve last event added
  db.query(
    "SELECT * FROM timed_event WHERE id_column_order = ? AND id_takt = ? ORDER BY time DESC",
    [id_column_order, id_takt],
    (error, results) => {
      if (error) return next(error);
      // No previous event for task. Start new task.
      if (results.length < 1) {
        // Tried to pause/end task that hasnt started yet.
        if (action.toLowerCase() !== "start") {
          return res.status(httpStatusCodes.BAD_REQUEST).json({
            message:
              "Bad request. Can't pause/finish task that has not started yet.",
          });
        }
        // Add new event as START
        const time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
        db.query(
          `INSERT INTO timed_event (id_work_order, id_column_order, id_takt, id_mobile_user, action, time) 
          VALUES (?, ?, ?, ?, ?, ?);`,
          [
            id_work_order,
            id_column_order,
            id_takt,
            id_mobile_user,
            "START",
            time,
          ],
          (error, results) => {
            if (error) return next(error);
            return res.status(httpStatusCodes.OK).json({
              message: "New event added successfuly.",
              action: "START",
              at: time,
            });
          }
        );
      } else {
        const lastEvent = results[0];

        // Check if task has already finished. No further events allowed.
        if (lastEvent.action.toLowerCase() === "finish") {
          return res
            .status(httpStatusCodes.BAD_REQUEST)
            .json({ message: "Bad request. Task is already finished." });
        }

        // Check if last event was start
        if (lastEvent.action.toLowerCase() === "start") {
          // Prevent two consecutve start events
          if (action.toLowerCase() === "start") {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
              message: "Bad request. Action is same as previous on task.",
            });
          }
          if (action.toLowerCase() === "pause") {
            // Add new event as PAUSE
            const time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
            db.query(
              `INSERT INTO timed_event (id_work_order, id_column_order, id_takt, id_mobile_user, action, time) 
            VALUES (?, ?, ?, ?, ?, ?);`,
              [
                id_work_order,
                id_column_order,
                id_takt,
                id_mobile_user,
                "PAUSE",
                time,
              ],
              (error, results) => {
                if (error) return next(error);
                return res.status(httpStatusCodes.OK).json({
                  message: "New event added successfuly.",
                  action: "PAUSE",
                  at: time,
                });
              }
            );
          } else {
            // Add new event as FINISH
            const time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
            db.query(
              `INSERT INTO timed_event (id_work_order, id_column_order, id_takt, id_mobile_user, action, time) 
            VALUES (?, ?, ?, ?, ?, ?);`,
              [
                id_work_order,
                id_column_order,
                id_takt,
                id_mobile_user,
                "FINISH",
                time,
              ],
              (error, results) => {
                if (error) return next(error);

                // Get all events with same id_column_order and id_takt
                db.query(
                  "SELECT * FROM timed_event WHERE id_column_order = ? AND id_takt = ?",
                  [id_column_order, id_takt],
                  (error, results) => {
                    if (error) return next(error);
                    // Safeguard but with proper use this should never happen
                    if (results.length < 2) {
                      return next(
                        new Error(
                          "Elapsed time calculation failed. Unexpected server error."
                        )
                      );
                    }
                    let totalElapsedTime = {
                      hours: 0,
                      minutes: 0,
                      seconds: 0,
                    };

                    for (let i = 0; i < results.length - 1; i++) {
                      const element1 = results[i];
                      if (element1.action.toLowerCase() !== "start") continue;
                      const element2 = results[i + 1];
                      const elapsedTime = moment.duration(
                        moment(element2.time, "YYYY-MM-DD HH:mm:ss").diff(
                          moment(element1.time, "YYYY-MM-DD HH:mm:ss")
                        )
                      );
                      totalElapsedTime.hours += elapsedTime.hours();
                      totalElapsedTime.minutes += elapsedTime.minutes();
                      totalElapsedTime.seconds += elapsedTime.seconds();
                    }

                    const totalElapsedTimeStr = [
                      totalElapsedTime.hours,
                      totalElapsedTime.minutes,
                      totalElapsedTime.seconds,
                    ]
                      .map((val) => {
                        return val < 10
                          ? "0".concat(val.toString())
                          : val.toString();
                      })
                      .join(":");

                    return res.status(httpStatusCodes.OK).json({
                      message: "New event added successfuly.",
                      action: "FINISH",
                      at: time,
                      totalElapsedTime,
                      totalElapsedTimeStr,
                    });
                  }
                );
              }
            );
          }
        }
        // Only action that remains to be checked on last event is pause
        // TODO can a task be ended from being paused?
        else if (lastEvent.action.toLowerCase() === "pause") {
          if (action.toLowerCase() === "pause") {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
              message: "Bad request. Action is same as previous on task.",
            });
          }
          if (action.toLowerCase() === "finish") {
            return res.status(httpStatusCodes.BAD_REQUEST).json({
              message: "Bad request. Can't finish task that is on pause.",
            });
          }
          // Only possible action left is start
          // Add new event as START
          const time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
          db.query(
            `INSERT INTO timed_event (id_work_order, id_column_order, id_takt, id_mobile_user, action, time) 
          VALUES (?, ?, ?, ?, ?, ?);`,
            [
              id_work_order,
              id_column_order,
              id_takt,
              id_mobile_user,
              "START",
              time,
            ],
            (error, results) => {
              if (error) return next(error);
              return res.status(httpStatusCodes.OK).json({
                message: "New event added successfuly.",
                action: "START",
                at: time,
              });
            }
          );
        } else {
          // Safety meassure
          // If all check are correct this should never happend.
          return next(
            new Error("Adding new event failed. Unexpected server error.")
          );
        }
      }
    }
  );
};

module.exports = {
  getEvents,
  getEventById,
  getEventsByQueryParams,
  getMostRecentEventByQueryParams,
  getStatusOfTaskByQueryParams,
  addEvent,
  getElapsedTimeOfEventsWithQueryParams,
};
