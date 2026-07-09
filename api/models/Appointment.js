module.exports = {

  attributes: {

    patient: {
      model: "patient"
    },

    doctor: {
      model: "doctor"
    },

    appointmentDate: {
      type: "string"
    },

    reason: {
      type: "string"
    },

    status: {
      type: "string",
      defaultsTo: "Pending"
    }

  }

};