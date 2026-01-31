const express = require("express");
const { 
  createTrip, 
  endTrip, 
  getAllTrips, 
  getTripById 
} = require("../controllers/trip.controller");
const router = express.Router();

router.post("/create", createTrip);
router.patch("/end/:tripId", endTrip);
router.get("/", getAllTrips);
router.get("/:tripId", getTripById);

module.exports = router;
