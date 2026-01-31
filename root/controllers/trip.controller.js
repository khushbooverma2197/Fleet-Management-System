const supabase = require("../config/supabase");

// Create a new trip
exports.createTrip = async (req, res) => {
  try {
    const { customer_id, vehicle_id, passengers, distance_km } = req.body;

    // Validate required fields
    if (!customer_id || !vehicle_id || !passengers || !distance_km) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Verify customer exists and has customer role
    const { data: customer, error: customerError } = await supabase
      .from("users")
      .select("*")
      .eq("id", customer_id)
      .eq("role", "customer")
      .single();

    if (customerError || !customer) {
      return res.status(400).json({ message: "Invalid customer_id. User must be a customer" });
    }

    // Get vehicle details
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("*")
      .eq("id", vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Check if vehicle is available
    if (!vehicle.isAvailable) {
      return res.status(400).json({ message: "Vehicle is not available" });
    }

    // Check passenger limit
    if (passengers > vehicle.allowed_passengers) {
      return res.status(400).json({ 
        message: `Passenger limit exceeded. Vehicle allows ${vehicle.allowed_passengers} passengers` 
      });
    }

    // Mark vehicle as unavailable
    await supabase
      .from("vehicles")
      .update({ isAvailable: false })
      .eq("id", vehicle_id);

    // Create trip with status 'ongoing'
    const { data, error } = await supabase
      .from("trips")
      .insert([{ 
        customer_id, 
        vehicle_id, 
        passengers, 
        distance_km,
        status: 'ongoing'
      }])
      .select();

    if (error) {
      // Rollback vehicle availability if trip creation fails
      await supabase
        .from("vehicles")
        .update({ isAvailable: true })
        .eq("id", vehicle_id);
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json({ message: "Trip created successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// End a trip
exports.endTrip = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Get trip details
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*, vehicles(*)")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if trip is already completed
    if (trip.status === 'completed') {
      return res.status(400).json({ message: "Trip is already completed" });
    }

    // Calculate trip cost
    const tripCost = trip.distance_km * trip.vehicles.rate_per_km;

    // Update trip status and cost
    const { data: updatedTrip, error: updateError } = await supabase
      .from("trips")
      .update({ 
        status: 'completed',
        trip_cost: tripCost
      })
      .eq("id", tripId)
      .select();

    if (updateError) {
      return res.status(400).json({ message: updateError.message });
    }

    // Set vehicle availability to true
    await supabase
      .from("vehicles")
      .update({ isAvailable: true })
      .eq("id", trip.vehicle_id);

    res.status(200).json({ 
      message: "Trip completed successfully", 
      data: updatedTrip,
      tripCost 
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all trips
exports.getAllTrips = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*, vehicles(*), users(*)");

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    const { tripId } = req.params;

    const { data, error } = await supabase
      .from("trips")
      .select("*, vehicles(*), users(*)")
      .eq("id", tripId)
      .single();

    if (error) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
