require("dotenv").config();
const express = require("express");
const cors = require("cors");
const logger = require("./middlewares/logger");
const notFound = require("./middlewares/notFound");

// Import routes
const userRoutes = require("./routes/user.routes");
const vehicleRoutes = require("./routes/vehicle.routes");
const tripRoutes = require("./routes/trip.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger); // Log all requests

// Routes
app.get("/", (req, res) => {
  res.json({ 
    message: "Fleet Management System API",
    endpoints: {
      users: "/api/users",
      vehicles: "/api/vehicles",
      trips: "/api/trips",
      analytics: "/api/users/analytics"
    }
  });
});

app.use("/api/users", userRoutes);
app.use("/api/vehicles", vehicleRoutes);
app.use("/api/trips", tripRoutes);

// 404 handler - must be last
app.use(notFound);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
