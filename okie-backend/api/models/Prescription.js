module.exports = {
  attributes: {
    consultation: { model: 'consultation', required: true },
    patient: { model: 'user', required: true },
    doctor: { model: 'user', required: true },   
    
    items: {
      collection: 'prescriptionitem',
      via: 'prescription'
    }
  },
};