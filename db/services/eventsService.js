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
  const { id_blind } = params;
  const [rows, fields] = await connection
    .promise()
    .query(`SELECT * FROM timed_event WHERE id_blind = ? `, [id_blind]);

  return rows;
};

exports.getStartTime = async (params) => {
  const { id } = params;

  const [rows, fields] = await connection
    .promise()
    .query(
      `SELECT * FROM timed_event WHERE id_blind = ? ORDER BY id_timed_event DESC `,
      [id]
    );

  return rows[0];
};

/* exports.getRecentEvent = async (params) => {
  const { id_column_order, id_takt, piece_num } = params;

  const [blindRows, countRows] = await connection
    .promise()
    .query(
      `SELECT id_blind FROM blind WHERE id_column_order = ? AND piece_number = ? AND id_takt = ? `,
      [id_column_order, piece_num, id_takt]
    );

  console.log(blindRows);

  const id_blind = blindRows[0].id_blind;

  const query = `SELECT * FROM timed_event WHERE id_column_order = ? AND id_takt = ? AND id_blind = ? ORDER BY id_timed_event DESC;`;

  const [rows, fields] = await connection
    .promise()
    .query(query, [id_column_order, id_takt, id_blind]);

  return rows[0];
}; */

exports.getUnifinishedUserBlinds = async (params) => {
  const { id_mobile_user } = params;

  const [rows, fields] = await connection
    .promise()
    .query(
      `SELECT * FROM blind WHERE id_mobile_user = ? AND status = 'inProgress';`,
      [id_mobile_user]
    );

  const [totalCount] = await connection
    .promise()
    .query(
      `SELECT COUNT(*) AS count FROM blind WHERE id_mobile_user = ? AND status = 'inProgress';`,
      [id_mobile_user]
    );

  for (let x = 0; x < rows.length; x++) {
    console.log("a", x);
    const [order] = await connection
      .promise()
      .query(`SELECT * FROM column_order WHERE id_column_order = ? ;`, [
        rows[x].id_column_order,
      ]);

    rows[x].id_customer_order = order[0].id_customer_order;
    rows[x].quantity = order[0].quantity;
    rows[x].order_no = order[0].order_no;

    console.log("order", order);
  }

  const total = totalCount[0].count;

  return { rows, total };
};

exports.getRecentEvent = async (params) => {
  const { id } = params;

  const query = `SELECT * FROM timed_event WHERE id_blind = ? ORDER BY id_timed_event DESC;`;

  const [rows, fields] = await connection.promise().query(query, [id]);

  return rows[0];
};

exports.addNewEvent = async (
  id_customer_order,
  id_column_order,
  id_takt,
  id_mobile_user,
  time,
  action,
  id_blind
) => {
  const [blindRows, countRows] = await connection
    .promise()
    .query(`SELECT status FROM blind WHERE id_blind = ?`, [id_blind]);

  console.log(blindRows);

  const status = blindRows[0].status;

  if (action === "FINISH") {
    await connection
      .promise()
      .query(`UPDATE blind SET status = 'finished' WHERE id_blind = ?`, [
        id_blind,
      ]);

    /*  const [countRows] = await connection
      .promise()
      .query(
        `SELECT * FROM blind WHERE status != 'finished' AND id_column_order = ?`,
        [id_column_order]
      );

    console.log("count rows", countRows.length);

    if (countRows.length === 0) {
      await connection
        .promise()
        .query(
          `UPDATE column_order SET status = 'finished' WHERE id_column_order = ?`,
          [id_column_order]
        );
    } */
  } else if (action === "START") {
    if (status === "none") {
      await connection
        .promise()
        .query(
          `UPDATE blind SET status = 'inProgress', id_mobile_user = ? WHERE id_blind = ?  `,
          [id_mobile_user, id_blind]
        );
    }
  }

  const [rows, fields] = await connection.promise().query(
    `INSERT INTO timed_event (time,action,id_mobile_user,id_customer_order,id_takt,id_column_order,id_blind) 
        VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      time,
      action,
      id_mobile_user,
      id_customer_order,
      id_takt,
      id_column_order,
      id_blind,
    ]
  );
  return rows.insertId;
};

/* exports.getMostRecentEventWithParams = async (params) => {
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
}; */
