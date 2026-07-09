module.exports = {
  attributes: {
    firstName: {
      type: 'string',
      required: true
    },
    lastName: {
      type: 'string',
      required: true
    },
    email: {
      type: 'string',
      required: true,
      unique: true
    },
    birthDate: {
      type: 'string', 
      required: true
    },
    age: {
      type: 'number' 
    },
    gender: {
      type: 'string',
      isIn: ['Male', 'Female', 'Other']
    },
    philHealthNumber: {
      type: 'string',
      allowNull: true 
    },
    hmoProvider: {
      type: 'string',
      allowNull: true
    },
    address: {
      type: 'string'
    },

    // --- Associations ---
    consultations: {
      collection: 'consultationticket',
      via: 'patient'
    }
  }
};