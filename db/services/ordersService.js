const connection = require("../connection");

exports.getTotalBlinds = async (params) => {
  const { id_column_order, id_takt } = params;

  const [rows, fields] = await connection
    .promise()
    .query(
      `SELECT piece_number,id_blind,status,id_mobile_user FROM blind WHERE id_column_order = ? AND id_takt = ? AND status = 'none' ORDER BY piece_number ASC`,
      [id_column_order, id_takt]
    );

  console.log(rows);

  return rows;
};

exports.getFinishedBlinds = async (params) => {
  const { id_column_order, id_takt } = params;

  const [rows, fields] = await connection
    .promise()
    .query(
      `SELECT COUNT(*) as total FROM blind WHERE id_column_order = ? AND id_takt = ? AND status='finished';`,
      [id_column_order, id_takt]
    );

  console.log(rows[0]);

  return rows[0].total;
};

exports.getBlindStatus = async (id) => {
  const [rows] = await connection
    .promise()
    .query(
      `SELECT * FROM blind WHERE id_column_order = ? ORDER BY piece_number ASC`,
      [id]
    );

  return rows;
};

exports.getColumnOrderStatus = async (params) => {
  const { id_column_order, id_takt } = params;

  const [rows] = await connection
    .promise()
    .query(
      `SELECT status,quantity FROM column_order WHERE id_column_order = ?`,
      [id_column_order]
    );

  return rows;
};

exports.addNewCustomerOrder = async (id_customer_order) => {
  const [rowCount] = await connection
    .promise()
    .query(`SELECT * FROM customer_order WHERE id_customer_order = ?`, [
      id_customer_order,
    ]);

  if (rowCount != 0) {
    return;
  } else {
    const [rows, fields] = await connection
      .promise()
      .query(
        `INSERT INTO customer_order (id_customer_order,status) VALUES (?,?)`,
        [id_customer_order, "inProgress"]
      );
    return rows.insertId;
  }
};

exports.addNewColumnOrder = async (
  id_column_order,
  id_customer_order,
  order_no,
  quantity
) => {
  const [rowCount] = await connection
    .promise()
    .query(`SELECT * FROM column_order WHERE id_column_order = ?`, [
      id_column_order,
    ]);

  if (rowCount != 0) {
    return;
  } else {
    const [rows, fields] = await connection
      .promise()
      .query(
        `INSERT INTO column_order (id_column_order,status,id_customer_order,order_no,quantity) VALUES (?,?,?,?,?)`,
        [id_column_order, "inProgress", id_customer_order, order_no, quantity]
      );

    for (let i = 1; i <= 4; i++) {
      for (let x = 1; x <= quantity; x++) {
        await connection
          .promise()
          .query(
            `INSERT INTO blind (id_column_order,status,piece_number,id_takt) VALUES (?,?,?,?)`,
            [id_column_order, "none", x, i]
          );
      }
    }

    return rows.insertId;
  }
};

exports.finishColumnOrder = async ({ id_column_order, id_takt }) => {
  if (id_takt === "4") {
    await connection
      .promise()
      .query(
        `UPDATE column_order SET status = 'finished' WHERE id_column_order = ?`,
        [id_column_order]
      );

    return;
  } else {
    return;
  }
};
