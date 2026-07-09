// api/controllers/PatientController.js
module.exports = {

  /**
   * Register a new patient profile record
   */
  register: async function(req, res) {
    try {
      const patient = await Patient.create(req.body).fetch();
      return res.json(patient);
    } catch (error) {
      console.error("Registration error:", error);
      return res.serverError(error);
    }
  },

  /**
   * Fetch all patient profiles in the database
   */
  findAll: async function(req, res) {
    try {
      const patients = await Patient.find();
      return res.json(patients);
    } catch (error) {
      console.error("FindAll error:", error);
      return res.serverError(error);
    }
  },

  /**
   * Find a specific patient profile by its unique record identifier
   */
  findOne: async function(req, res) {
    try {
      const patient = await Patient.findOne({
        id: req.params.id
      });

      if (!patient) {
        return res.notFound({ message: "Patient record not found." });
      }

      return res.json(patient);
    } catch (error) {
      console.error("FindOne error:", error);
      return res.serverError(error);
    }
  },

  /**
   * Dynamic lookup parsing text targets matching partial name patterns or emails
   * Query Param: /api/patients/search?q=Juan
   */
  search: async function(req, res) {
    try {
      const q = req.query.q;

      // Handle missing or empty query inputs gracefully to prevent database scanning bottlenecks
      if (!q || q.trim() === "") {
        return res.badRequest({ message: "Search parameter 'q' is required." });
      }

      // Executes a multi-column compound conditional evaluation inside the Waterline query engine
      const patients = await Patient.find({
        or: [
          { firstName: { contains: q } },
          { lastName: { contains: q } },
          { email: { contains: q } }
        ]
      });

      return res.json(patients);
    } catch (error) {
      console.error("Search error:", error);
      return res.serverError(error);
    }
  },

  /**
   * Update an existing patient profile data structure (PhilHealth, HMO, Age, etc.)
   * Target: PATCH /api/patients/:id
   */
  update: async function(req, res) {
    try {
      const id = req.params.id;

      // Updates structural attributes based on parameters sent in body
      const updatedPatient = await Patient.updateOne({ id: id }).set(req.body);

      if (!updatedPatient) {
        return res.notFound({ message: "Patient record not found to update." });
      }

      return res.json(updatedPatient);
    } catch (error) {
      console.error("Update error:", error);
      return res.serverError(error);
    }
  }

};