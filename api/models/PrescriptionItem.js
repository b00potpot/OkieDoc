module.exports = {
  attributes: {
    medicationName: { type: 'string', required: true },
    dosage: { type: 'string' },
    frequency: { type: 'string' },
    duration: { type: 'string' },

    // Foreign key pointing back to the parent container
    prescription: { model: 'prescription', required: true }
  },
};