module.exports = {
  attributes: {
    // Controller and Frontend expect fullName, not split names
    fullName: {
      type: "string",
      required: true
    },
    // CRITICAL: Required for DoctorController.findBySpecialization
    specialization: {
      type: "string",
      required: true 
    },
    // CRITICAL: Required to filter active doctors
    status: {
      type: "string",
      defaultsTo: "Active"
    },
    // CRITICAL: Required for Step 2 and Step 5 of SpecialistAppointmentScreen
    consultationFee: {
      type: "number",
      defaultsTo: 0
    },
    
    // The rest of your existing demographic fields
    birthDate: { type: "string" },
    sex: { type: "string" },
    contactNumber: { type: "string" },
    email: { type: "string" },
    address: { type: "string", allowNull: true },
    philHealthNumber: { type: "string", allowNull: true },
    hmoProvider: { type: "string", allowNull: true },

    // --- Associations ---
    consultations: {
      collection: 'consultationticket',
      via: 'specialist' // Must match the property key name in ConsultationTicket.js
    }
  }
};