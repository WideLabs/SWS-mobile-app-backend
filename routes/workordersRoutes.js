const express = require("express");
const router = express.Router();
const {
  startTimer,
  endTimer,
  getStatus,
} = require("../controllers/workordersController");

router.get("/status", getStatus);
router.post("/start", startTimer);
router.post("/end", endTimer);

module.exports = router;
