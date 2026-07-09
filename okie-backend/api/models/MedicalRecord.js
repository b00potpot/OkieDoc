module.exports = {
  attributes: {
    // -----------------------------------------------------------
    // Existing Attributes
    // -----------------------------------------------------------
    patient: {
      model: "patient"
    },

    consultation: {
      model: "consultationticket"
    },

    diagnosis: {
      type: "string"
    },

    remarks: {
      type: "string"
    },

    // -----------------------------------------------------------
    // Newly Added Attributes
    // -----------------------------------------------------------
    allergies: {
      type: "string",
      defaultsTo: "None",
      description: "List of patient allergies (e.g., Penicillin, Peanuts)"
    },

    active_diseases: {
      type: "string",
      defaultsTo: "None",
      description: "Currently active conditions or diseases"
    },

    past_diseases: {
      type: "string",
      defaultsTo: "None",
      description: "Resolved or past medical conditions"
    },

    family_history: {
      type: "string",
      defaultsTo: "None",
      description: "Relevant hereditary or familial medical history"
    },

    social_history: {
      type: "string",
      defaultsTo: "None",
      description: "Lifestyle factors (e.g., smoking, alcohol consumption, occupation)"
    },

    surgeries: {
      type: "string",
      defaultsTo: "None",
      description: "Past surgical procedures"
    },

    current_medications: {
      type: "string",
      defaultsTo: "None",
      description: "List of medications the patient is currently taking"
    }
  }
};