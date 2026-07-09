module.exports = {

  attributes: {

    consultation: {
      model: "consultationticket"
    },

    patient: {
      model: "patient"
    },

    doctor: {
      model: "doctor"
    },

    testName: {
      type: "string"
    },

    clinicalIndication: {
      type: "string"
    },

    status: {
      type: "string",
      defaultsTo: "Requested"
    }

  }

};