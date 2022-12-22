const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  addUser,
  loginUser,
  changeUserPin,
} = require("../controllers/usersController");

router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/", addUser);
router.post("/login", loginUser);
router.patch("/pin", changeUserPin);

module.exports = router;
