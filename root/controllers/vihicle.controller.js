const supabase = require("../config/supabase");

// Add a new vehicle
exports.addVehicle = async (req, res) => {
  try {
    const { name, registration_number, allowed_passengers, rate_per_km, owner_id } = req.body;

    // Validate required fields
    if (!name || !registration_number || !allowed_passengers || !rate_per_km || !owner_id) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify owner exists and has owner role
    const { data: owner, error: ownerError } = await supabase
      .from("users")
      .select("*")
      .eq("id", owner_id)
      .eq("role", "owner")
      .single();

    if (ownerError || !owner) {
      return res.status(400).json({ message: "Invalid owner_id. User must be an owner" });
    }

    // Insert vehicle (isAvailable defaults to true in DB)
    const { data, error } = await supabase
      .from("vehicles")
      .insert([{ name, registration_number, allowed_passengers, rate_per_km, owner_id }])
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: "Vehicle created successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Assign a driver to a vehicle
exports.assignDriver = async (req, res) => {
  try {
    const { driver_id } = req.body;
    const { vehicleId } = req.params;

    // Validate required fields
    if (!driver_id) {
      return res.status(400).json({ message: "driver_id is required" });
    }

    // Verify driver exists and has driver role
    const { data: driver, error: driverError } = await supabase
      .from("users")
      .select("*")
      .eq("id", driver_id)
      .eq("role", "driver")
      .single();

    if (driverError || !driver) {
      return res.status(400).json({ message: "Invalid driver_id. User must be a driver" });
    }

    // Update vehicle
    const { data, error } = await supabase
      .from("vehicles")
      .update({ driver_id })
      .eq("id", vehicleId)
      .select();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ message: "Driver assigned successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all vehicles
exports.getAllVehicles = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("vehicles")
      .select("*");

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get a single vehicle by ID
exports.getVehicleById = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicleId)
      .single();

    if (error) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
