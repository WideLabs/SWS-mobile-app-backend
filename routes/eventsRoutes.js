const express = require("express");
const router = express.Router();
const {
  getEvents,
  getEventById,
  getEventsByQueryParams,
  getMostRecentEventByQueryParams,
  getStatusOfTaskByQueryParams,
  addEvent,
} = require("../controllers/eventsController");

router.get("/", getEvents);
router.get("/:id", getEventById);
router.get("/query/all", getEventsByQueryParams);
router.get("/query/recent", getMostRecentEventByQueryParams);
router.get("/query/status", getStatusOfTaskByQueryParams);
router.post("/", addEvent);

module.exports = router;
