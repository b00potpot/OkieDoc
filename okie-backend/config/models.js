module.exports.models = {

  migrate: 'alter',

  attributes: {
    createdAt: { type: 'number', autoCreatedAt: true },
    updatedAt: { type: 'number', autoUpdatedAt: true },
    id: { type: 'number', autoIncrement: true },
  },

  dataEncryptionKeys: {
    default: '1X3rkxWiBT1xYbCaB0oF95oJGveo5NKmBJQZ1bIc1c8='
  },

  cascadeOnDestroy: true

};