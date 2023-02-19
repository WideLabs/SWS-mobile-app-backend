const connection = require("../connection");

exports.getAllUsers = async () => {
  const [rows, fields] = await connection
    .promise()
    .query(
      "SELECT username AS value,name AS label,pin FROM mobile_user ORDER BY name ASC;"
    );
  return rows;
};

exports.getUserById = async (id) => {
  const [rows, fields] = await connection
    .promise()
    .query("SELECT username, name FROM mobile_user WHERE id_mobile_user = ?;", [
      id,
    ]);
  return rows[0];
};

exports.getUserByUsername = async (username) => {
  const [rows, fields] = await connection
    .promise()
    .query("SELECT * FROM mobile_user WHERE username = ?;", [username]);
  return rows;
};

exports.addNewUser = async (name, username, pin) => {
  const [rows, fields] = await connection
    .promise()
    .query("INSERT INTO mobile_user (name, username, pin) VALUES (?, ?, ?);", [
      name,
      username,
      pin,
    ]);
  return rows;
};

exports.changeUserPin = async (id, pin) => {
  const [results] = await connection
    .promise()
    .query("UPDATE mobile_user SET pin = ? WHERE id_mobile_user = ?;", [
      pin,
      id,
    ]);

  if (results.affectedRows < 1) {
    throw new Error("Pin change failed. Unexpected server error.");
  }

  return results;
};
