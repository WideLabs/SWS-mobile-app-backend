const { P } = require("pino");
const db = require("../db");

const getUsers = async (req, res, next) => {
  db.query(
    "SELECT username AS value,name AS label FROM mobile_users",
    (error, results, fields) => {
      if (error) {
        return next(error);
      }
      return res.status(200).json(results);
    }
  );
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(password);
  console.log(username);
  db.query(
    "SELECT * FROM mobile_users WHERE username = ?",
    [username],
    (error, results, fields) => {
      if (error) return console.error(error.message);

      console.log(results);

      if (results[0].password === password) {
        return res.status(200).json(results);
      } else {
        return res.status(404).json({ message: "Incorrect PIN" });
      }
    }
  );
};

const changePin = async (req, res, next) => {
  const { username, new_pin } = req.body;

  console.log(username);
  console.log(new_pin);

  db.query(
    "UPDATE mobile_users SET password = ? WHERE username = ?",
    [new_pin, username],
    (error, results, fields) => {
      if (error) return console.error(error.message);

      console.log(results);

      res.status(200).json(results);
    }
  );
};

module.exports = {
  getUsers,
  loginUser,
  changePin,
};
