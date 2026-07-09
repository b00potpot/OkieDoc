// api/models/User.js

module.exports = {
  description: 'Centralized User identity. Handles login credentials and global identification.',

  attributes: {
    email: { type: 'string', required: true, unique: true, isEmail: true },
    password: { type: 'string', required: true, protect: true },
    
    role: {
      type: 'string',
      required: true,
      isIn: ['patient', 'doctor', 'nurse', 'admin', 'system'], 
    },

    // =========================================================
    // Profile Associations (One-to-One)
    // =========================================================
    
    patientProfile: { model: 'patient' },
    doctorProfile: { model: 'doctor' },
    nurseProfile: { model: 'nurse' },

    // The logs this user has created
    activityLogs: {
      collection: 'followupactivitylog',
      via: 'performedBy'
    }
  },
};