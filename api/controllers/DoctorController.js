// api/controllers/DoctorController.js
module.exports = {

  /**
   * Create a new Doctor profile entry record
   */
  create: async function (req, res) {
    console.log("REQ BODY:", req.body);
    try {
      const { fullName, specialization, status } = req.body;

      if (!fullName) {
        return res.badRequest({
          error: "fullName is required"
        });
      }

      const doctor = await Doctor.create({
        fullName,
        specialization,
        status: status || 'Active' // Fallback flag string initialization
      }).fetch();

      return res.json(doctor);

    } catch (err) {
      console.error("Doctor creation error:", err);
      return res.serverError(err);
    }
  },

  /**
   * Fetch all recorded Doctor profiles
   */
  findAll: async function (req, res) {
    try {
      const doctors = await Doctor.find();
      return res.json(doctors);
    } catch (err) {
      console.error("FindAll Doctors error:", err);
      return res.serverError(err);
    }
  },

  /**
   * Dynamic lookup parsing text targets matching explicit specialization domains
   * Query Param: /doctors/specialization?specialization=Pediatrics
   */
  findBySpecialization: async function(req, res) {
    try {
      const specialization = req.query.specialization;

      if (!specialization) {
        return res.badRequest({ error: "Specialization query parameter is required." });
      }

      // Finds active physicians (handles either boolean or string flag states safely)
      const doctors = await Doctor.find({
        specialization: specialization,
        status: ['Active', 'active', true] 
      });

      return res.json(doctors);
    } catch (err) {
      console.error("FindBySpecialization error:", err);
      return res.serverError(err);
    }
  },

  /**
   * Compute dynamic slot reservation availability differences for a specific provider on a selected date
   * Query Params: /doctors/availability?doctorId=2&date=2026-06-15
   */
  availability: async function(req, res) {
    try {
      const doctorId = req.query.doctorId;
      const date = req.query.date;

      if (!doctorId || !date) {
        return res.badRequest({ error: "Both doctorId and date parameter formats are mandatory." });
      }

      // Query mapped to match the 'specialist' entity link from your ConsultationTicket schema definition
      const consultations = await ConsultationTicket.find({
        specialist: doctorId,
        appointmentDate: date,
        status: { '!=': 'Cancelled' } // Don't block slots for appointments that were cancelled
      });

      // Extract unique string time configurations
      const booked = consultations.map(c => c.appointmentTime).filter(Boolean);

      const allSlots = [
        "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
        "16:00", "16:30", "17:00"
      ];

      // Computes array difference set elements
      const available = allSlots.filter(slot => !booked.includes(slot));

      return res.json({
        date,
        available,
        booked
      });
    } catch (err) {
      console.error("Availability matrix lookup calculation error:", err);
      return res.serverError(err);
    }
  }

};