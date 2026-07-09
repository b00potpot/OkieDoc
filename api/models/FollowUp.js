module.exports = {
  attributes: {
    // ==========================================
    // Core Identifiers & Relations
    // ==========================================
    followUpNumber: { type: 'string', required: true },
    ticketId: { model: 'ConsultationTicket' , required: true }, 
    consultationId: { model: 'consultation', required: true },
    patient: { model: 'patient', required: true }, 

    // ==========================================
    // Assignments
    // ==========================================
    assignedNurseId: { model: 'nurse' },
    assignedDoctorId: { model: 'doctor' },
    specialistId: { model: 'doctor' },

    // ==========================================
    // State & Tracking
    // ==========================================
    status: { 
      type: 'string', 
      isIn: ['Unread', 'Replied', 'WaitingForPatient', 'Closed'],
      defaultsTo: 'Unread' 
    },
    priority: {
      type: 'string',
      isIn: ['Low', 'Normal', 'High', 'Urgent'],
      defaultsTo: 'Normal'
    },
    isClosed: { type: 'boolean', defaultsTo: false },

    // ==========================================
    // Timestamps (Using string for ISO dates per your setup)
    // ==========================================
    expiresAt: { type: 'string' }, 
    closedAt: { type: 'string' },
    reopenedAt: { type: 'string' },
    lastMessageAt: { type: 'string' },
    
    // Unread Tracking
    lastReadByPatientAt: { type: 'string' },
    lastReadByStaffAt: { type: 'string' },

    // Archival & General Activity
    archivedAt: { type: 'string' },
    lastActivityDate: { type: 'string' }
  }
};