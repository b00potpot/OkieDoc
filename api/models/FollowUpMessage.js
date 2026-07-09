module.exports = {
  attributes: {
    // ==========================================
    // Core Relations
    // ==========================================
    followUp: { model: 'followup', required: true },

    // ==========================================
    // Sender Information
    // ==========================================
    senderId: { model: 'user', required: true }, 
    senderType: {
      type: 'string',
      isIn: ['patient', 'nurse', 'doctor', 'system'],
      required: true
    },

    // ==========================================
    // Message Content & Type
    // ==========================================
    message: { type: 'string', columnType: 'text', required: true }, // Kept text column for long strings
    messageType: {
      type: 'string',
      isIn: ['text', 'image', 'prescription', 'lab', 'system'],
      defaultsTo: 'text'
    },
    attachments: { 
      type: 'json', 
      description: 'Stores an array of attachment URLs or file metadata' 
    },
    isSystemGenerated: { type: 'boolean', defaultsTo: false },

    // ==========================================
    // Status & Read Receipts
    // ==========================================
    isRead: { type: 'boolean', defaultsTo: false },
    readAt: { type: 'string' }, // ISO date string
    sentAt: { type: 'string' }  // ISO date string
  }
};