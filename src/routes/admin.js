const { Router } = require("express");
const {
  createTimeBlock,
  ListReservations,
} = require("../controllers/adminController");
const authenticationToken = require("../middlewares/auth");

const router = Router();

router.post("/time-blocks", authenticationToken, createTimeBlock);
router.get("/reservations", authenticationToken, ListReservations);

module.exports = router;
