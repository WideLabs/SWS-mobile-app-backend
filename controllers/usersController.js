const db = require("../db");
const httpStatusCodes = require("../utils/httpStatusCodes");

// Route GET /users
// Desc Returns all users in db
const getUsers = (req, res, next) => {
  db.query(
    "SELECT username AS value,name AS label FROM mobile_user ORDER BY name ASC;",
    (error, results) => {
      if (error) return next(error);

      return res.status(httpStatusCodes.OK).json(results);
    }
  );
};

// Route GET /users/:id
// Desc Return user specified by id
const getUserById = (req, res, next) => {
  const { id } = req.params;
  db.query(
    "SELECT username, name FROM mobile_user WHERE id_mobile_user = ?;",
    [id],
    (error, results) => {
      if (error) return next(error);
      if (results.length < 1)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .json({ message: `User not found by id: {${id}}` });

      return res.status(httpStatusCodes.OK).json(results);
    }
  );
};

// Route POST /users
// Desc Adds new user
const addUser = (req, res, next) => {
  const { name, username, pin } = req.body;
  if (!name || !username || !pin)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Bad request. Missing properties in body." });
  if (pin.length < 4 || pin.length > 10)
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Bad request. Pin length must be between 4 and 10 numbers.",
    });

  db.query(
    "INSERT INTO mobile_user (name, username, pin) VALUES (?, ?, ?)",
    [name, username, pin],
    (error, results) => {
      if (error) return next(error);

      return res.sendStatus(httpStatusCodes.OK);
    }
  );
};

// Route POST /users/login
// Desc Log in user with username and pin
const loginUser = (req, res, next) => {
  const { username, pin } = req.body;
  if (!username || !pin)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Bad request. Missing properties in body." });

  db.query(
    "SELECT * FROM mobile_user WHERE username = ?;",
    [username],
    (error, results) => {
      if (error) return next(error);
      if (results.length < 1)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .json({ message: "Login failed. User does not exist." });
      if (results[0].pin !== pin)
        return res
          .status(httpStatusCodes.UNAUTHORIZED)
          .json({ message: "Login failed. Incorrect PIN." });

      // Map removes pin from returning result
      return res.status(httpStatusCodes.OK).json(
        [results[0]].map(({ pin, ...rest }) => {
          return rest;
        })[0]
      );
    }
  );
};

// Route PATCH /users/pin
// Desc Change pin of user with username
const changeUserPin = (req, res, next) => {
  const { username, pin } = req.body;
  if (!username || !pin)
    return res
      .status(httpStatusCodes.BAD_REQUEST)
      .json({ message: "Bad request. Missing properties in body." });
  if (pin.length < 4 || pin.length > 10)
    return res.status(httpStatusCodes.BAD_REQUEST).json({
      message: "Bad request. Pin length must be between 4 and 10 numbers.",
    });
  db.query(
    "SELECT id_mobile_user FROM mobile_user WHERE username = ?;",
    [username],
    (error, results) => {
      if (error) return next(error);
      if (results.length < 1)
        return res
          .status(httpStatusCodes.NOT_FOUND)
          .json({ message: "Pin change failed. User not found." });
      const id = results[0].id_mobile_user;

      db.query(
        "UPDATE mobile_user SET pin = ? WHERE id_mobile_user = ?;",
        [pin, id],
        (error, results) => {
          if (error) return next(error);
          if (results.affectedRows < 1) {
            return next(
              new Error("Pin change failed. Unexpected server error.")
            );
          }
          return res.sendStatus(httpStatusCodes.OK);
        }
      );
    }
  );
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  loginUser,
  changeUserPin,
};
