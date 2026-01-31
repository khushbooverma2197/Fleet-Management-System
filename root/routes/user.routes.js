const express = require("express");
const { signup, getAllUsers, getAnalytics } = require("../controllers/user.controller");
const router = express.Router();

router.post("/signup", signup);
router.get("/", getAllUsers);
router.get("/analytics", getAnalytics);

module.exports = router;
