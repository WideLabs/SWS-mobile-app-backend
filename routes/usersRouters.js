const express = require("express");
const router = express.Router();
const {
  getUsers,
  loginUser,
  changePin,
} = require("../controllers/usersController");

router.route("/").get(getUsers).post(loginUser);

router.route("/pin").post(changePin);

module.exports = router;
