const connection = require("../connection");

exports.getAllEvents = async () => {
  const [rows, fields] = await connection
    .promise()
    .query("SELECT * FROM timed_event;");
  return rows;
};

exports.getEventById = async (id) => {
  const [rows, fields] = await connection
    .promise()
    .query("SELECT * FROM timed_event WHERE id_timed_event = ?;", [id]);
  return rows;
};

exports.getAllEventsWithParams = async (params) => {
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

  const [rows, fields] = await connection
    .promise()
    .query(query, paramsQueryValues);

  return rows;
};

exports.getMostRecentEventWithParams = async (params) => {
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
  )} ORDER BY id_timed_event DESC;`;

  const [rows, fields] = await connection
    .promise()
    .query(query, paramsQueryValues);

  return rows[0];
};

exports.addNewEvent = async (
  id_work_order,
  id_column_order,
  id_takt,
  id_mobile_user,
  time,
  action
) => {
  const [rows, fields] = await connection.promise().query(
    `INSERT INTO timed_event (id_work_order, id_column_order, id_takt, id_mobile_user, time, action) 
    VALUES (?, ?, ?, ?, ?, ?);`,
    [id_work_order, id_column_order, id_takt, id_mobile_user, time, action]
  );
  return rows.insertId;
};
