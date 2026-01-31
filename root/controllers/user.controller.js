const supabase = require("../config/supabase");

// User Signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate role
    const validRoles = ["customer", "owner", "driver"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role. Must be customer, owner, or driver" });
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([{ name, email, password, role }])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      return res.status(400).json({ message: error.message, details: error });
    }

    res.status(201).json({ message: "User created successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all users (for testing)
exports.getAllUsers = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at");

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Count customers
    const { count: totalCustomers, error: customerError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    // Count owners
    const { count: totalOwners, error: ownerError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "owner");

    // Count drivers
    const { count: totalDrivers, error: driverError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "driver");

    // Count vehicles
    const { count: totalVehicles, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*", { count: "exact", head: true });

    // Count trips
    const { count: totalTrips, error: tripError } = await supabase
      .from("trips")
      .select("*", { count: "exact", head: true });

    if (customerError || ownerError || driverError || vehicleError || tripError) {
      return res.status(400).json({ message: "Error fetching analytics" });
    }

    res.status(200).json({
      totalCustomers: totalCustomers || 0,
      totalOwners: totalOwners || 0,
      totalDrivers: totalDrivers || 0,
      totalVehicles: totalVehicles || 0,
      totalTrips: totalTrips || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
