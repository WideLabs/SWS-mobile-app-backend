const express = require("express");

const {
  addNewOrder,
  updateOrder,
  getBlinds,
} = require("../controllers/ordersController");
const router = express.Router();

router.post("/", addNewOrder);

router.post("/update", updateOrder);

router.get("/blinds", getBlinds);

module.exports = router;
