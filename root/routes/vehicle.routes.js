const express = require("express");
const rateLimiter = require("../middlewares/ratelimiter.js");
const { 
  addVehicle, 
  assignDriver, 
  getAllVehicles, 
  getVehicleById 
} = require("../controllers/vihicle.controller");
const router = express.Router();

router.post("/add", rateLimiter, addVehicle);
router.patch("/assign-driver/:vehicleId", assignDriver);
router.get("/", getAllVehicles);
router.get("/:vehicleId", getVehicleById);

module.exports = router;
