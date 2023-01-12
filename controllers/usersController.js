const httpStatusCodes = require("../utils/httpStatusCodes");
const usersDbService = require("../db/services/usersService");

// Route GET /users
// Desc Returns all users in db
const getUsers = async (req, res, next) => {
  try {
    const results = await usersDbService.getAllUsers();
    return res.status(httpStatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

// Route GET /users/:id
// Desc Return user specified by id
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await usersDbService.getUserById(id);

    if (results.length < 1) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: `User not found by id: {${id}}.` });
    }

    return res.status(httpStatusCodes.OK).json(results);
  } catch (error) {
    next(error);
  }
};

// Route POST /users
// Desc Adds new user
const addUser = async (req, res, next) => {
  try {
    const { name, username, pin } = req.body;

    if (!name || !username || !pin) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Bad request. Missing properties in body." });
    }

    if (pin.length < 4 || pin.length > 10) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        message: "Bad request. Pin length must be between 4 and 10 numbers.",
      });
    }

    await usersDbService.addNewUser(name, username, pin);
    return res.status(httpStatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

// Route POST /users/login
// Desc Log in user with username and pin
const loginUser = async (req, res, next) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      if (!username || !pin)
        return res
          .status(httpStatusCodes.BAD_REQUEST)
          .json({ message: "Bad request. Missing properties in body." });
    }

    const existingUser = (await usersDbService.getUserByUsername(username))[0];
    if (!existingUser) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "Login failed. User does not exist." });
    }

    if (existingUser.pin !== pin) {
      return res
        .status(httpStatusCodes.UNAUTHORIZED)
        .json({ message: "Login failed. Incorrect PIN." });
    }

    // Map removes pin from returning result
    return res.status(httpStatusCodes.OK).json(
      [existingUser].map(({ pin, ...rest }) => {
        return rest;
      })[0]
    );
  } catch (error) {
    next(error);
  }
};

// Route PATCH /users/pin
// Desc Change pin of user with username
const changeUserPin = async (req, res, next) => {
  try {
    const { username, pin } = req.body;

    if (!username || !pin) {
      return res
        .status(httpStatusCodes.BAD_REQUEST)
        .json({ message: "Bad request. Missing properties in body." });
    }

    if (pin.length < 4 || pin.length > 10) {
      return res.status(httpStatusCodes.BAD_REQUEST).json({
        message: "Bad request. Pin length must be between 4 and 10 numbers.",
      });
    }

    const existingUser = (await usersDbService.getUserByUsername(username))[0];
    if (!existingUser) {
      return res
        .status(httpStatusCodes.NOT_FOUND)
        .json({ message: "Pin change failed. User not found." });
    }

    await usersDbService.changeUserPin(existingUser.id_mobile_user, pin);
    return res.sendStatus(httpStatusCodes.OK);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  addUser,
  loginUser,
  changeUserPin,
};
