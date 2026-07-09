module.exports = {
  attributes: {
    // -----------------------------------------------------------
    // Existing Attributes
    // -----------------------------------------------------------
    patientName: { type: 'string', required: true },
    patientAge: { type: 'number', required: true },
    patientGender: { type: 'string', required: true },
    symptoms: { type: 'string', required: true },
    nurseRemarks: { type: 'string', required: true },
    consultationNotes: { type: 'string', defaultsTo: '' },
    
    // You may want to phase these out if you use the 'doctor' relation below,
    // but they are kept here so nothing breaks.
    assignedGP: { type: 'string', defaultsTo: 'Unassigned' },
    assignedSpecialist: { type: 'string', defaultsTo: 'Unassigned' },
    
    status: {
      type: 'string',
      isIn: ['Pending', 'Assigned to GP', 'Assigned to Specialist', 'Completed'],
      defaultsTo: 'Pending'
    },

    // -----------------------------------------------------------
    // Newly Added Attributes
    // -----------------------------------------------------------
    urgency_level: { 
      type: 'string', 
      isIn: ['Low', 'Normal', 'High', 'Critical'], // Optional constraint
      defaultsTo: 'Normal' 
    },
    
    callback_number: { 
      type: 'string' // String is preferred over number to preserve '+' signs and leading zeros
    },
    
    is_callback: { 
      type: 'boolean', 
      defaultsTo: false 
    },
    
    is_urgent: { 
      type: 'boolean', 
      defaultsTo: false 
    },

    // -----------------------------------------------------------
    // Relational Attributes (Traceability)
    // -----------------------------------------------------------
    
    // Links to the original callback request for traceability
    callbackRequestId: {
      type: 'string', // Change to `model: 'callbackrequest'` if you have a Waterline model for it
      required: false // Set to true ONLY if every consultation must come from a callback
    },

    // Links to a Patient model (Change to type: 'string' if storing an ID directly)
    patient: { 
      model: 'patient',
      required: true 
    },
    
    // Links to a Doctor/User model 
    doctor: { 
      model: 'doctor' 
    },
    
    // Links to a Nurse/User model
    nurse: { 
      model: 'nurse' 
    }
  },
};