module.exports = {
  attributes: {
    // Unique Identifier & Operational Status
    ticketNumber: {
      type: 'string',
      unique: true,
      required: true
    },
    status: {
      type: 'string',
      isIn: [
        'Draft', 
        'Pending Triage', 
        'Assigned to Nurse', 
        'Waiting', 
        'In Consultation', 
        'Pending Payment',   
        'Completed', 
        'Closed',            
        'Cancelled'
      ],
      defaultsTo: 'Draft'
    },
    isDraft: {
      type: 'boolean',
      defaultsTo: true
    },
    closeReason: {
      type: 'string',
      allowNull: true
    },

    // Staff & Entity Relationships
    assignedNurse: {
      model: 'nurse'
    },
    patient: {
      model: 'patient' 
    },
    specialist: {
      model: 'doctor' 
    },
    specialistType: {
      type: 'string',
      allowNull: true 
    },

    // Patient Information (Fallback fields if registration is inline/anonymous)
    fullName: { type: 'string', allowNull: true },
    mobileNumber: { type: 'string', allowNull: true },
    email: { type: 'string', isEmail: true, allowNull: true },
    birthDate: { type: 'string', allowNull: true }, 
    gender: { type: 'string', isIn: ['Male', 'Female', 'Other'], allowNull: true },

    // Address Context Data
    streetAddress: { type: 'string', allowNull: true },
    region: { type: 'string', allowNull: true },
    province: { type: 'string', allowNull: true },
    cityMunicipality: { type: 'string', allowNull: true },
    barangay: { type: 'string', allowNull: true },

    // Healthcare & Coverage Info
    philhealthMember: { type: 'boolean', defaultsTo: false },
    philHealthNumber: { type: 'string', allowNull: true }, 
    hmoProvider: { type: 'string', allowNull: true },
    subscriptionType: { type: 'string', allowNull: true },

    // Core Consultation & Scheduling Meta
    consultationType: {
      type: 'string',
      isIn: [
        'Chat Consultation',
        'Voice Consultation',
        'Video Consultation',
        'Specialist Consultation',
        'Callback Request',
        'Face-to-Face'
      ]
    }, 
    appointmentDate: {
      type: 'string', 
      allowNull: true
    },
    appointmentTime: {
      type: 'string', 
      allowNull: true
    },

    // Medical Intake Records
    chiefComplaint: { type: 'string', allowNull: true },
    symptoms: {
      type: 'json',
      defaultsTo: [] 
    },
    otherSymptoms: { type: 'string', allowNull: true },

    // Diagnostic Pain Map Configuration
    painAreas: {
      type: 'json', 
      defaultsTo: []
    },
    painView: {
      type: 'string',
      isIn: ['front', 'back'],
      allowNull: true
    },

    // Billing, Financial & Gateway Integrations
    consultationFee: {
      type: 'number',
      defaultsTo: 0
    },
    bookingFee: {
      type: 'number',
      defaultsTo: 200 
    },
    totalAmount: {
      type: 'number',
      defaultsTo: 0
    },
    paymentLink: {
      type: 'string',
      allowNull: true
    },
    invoiceGenerated: {
      type: 'boolean',
      defaultsTo: false
    }
  },

  // --- Lifecycle Hooks ---
  beforeCreate: async function (valuesToCreate, proceed) {
    // 1. Calculate dynamic transactional aggregates
    valuesToCreate.totalAmount = (valuesToCreate.consultationFee || 0) + (valuesToCreate.bookingFee || 0);

    // 2. Real Sequential Assignment Generation
    if (valuesToCreate.isDraft === false && !valuesToCreate.ticketNumber) {
      const count = await ConsultationTicket.count();
      valuesToCreate.ticketNumber = `SA-${String(count + 1).padStart(5, '0')}`;
      
      if (valuesToCreate.status === 'Draft') {
        valuesToCreate.status = 'Pending Triage'; 
      }
    }
    return proceed();
  },

  beforeUpdate: async function (valuesToUpdate, proceed) {
    // 1. Recalculate billing values if fee elements alter dynamically
    if (valuesToUpdate.consultationFee !== undefined || valuesToUpdate.bookingFee !== undefined) {
      const currentRecord = await ConsultationTicket.findOne({ id: valuesToUpdate.id });
      
      const conFee = valuesToUpdate.consultationFee !== undefined ? valuesToUpdate.consultationFee : (currentRecord ? currentRecord.consultationFee : 0);
      const bookFee = valuesToUpdate.bookingFee !== undefined ? valuesToUpdate.bookingFee : (currentRecord ? currentRecord.bookingFee : 200);
      
      valuesToUpdate.totalAmount = conFee + bookFee;
    }

    // 2. Real Sequential Assignment Generation Guard
    if (valuesToUpdate.isDraft === false && !valuesToUpdate.ticketNumber) {
      const count = await ConsultationTicket.count();
      valuesToUpdate.ticketNumber = `SA-${String(count + 1).padStart(5, '0')}`;
      
      if (valuesToUpdate.status === 'Draft') {
        valuesToUpdate.status = 'Pending Triage';
      }
    }
    return proceed();
  }
};