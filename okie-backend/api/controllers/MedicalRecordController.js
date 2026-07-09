module.exports = {

  create: async function(req, res) {

    const record = await MedicalRecord.create(req.body)
      .fetch();

    return res.json(record);
  },

  findByPatient: async function(req, res) {

    const patientId = req.params.patientId;

    const records = await MedicalRecord.find({
      patient: patientId
    });

    return res.json(records);
  },

  findByConsultation: async function(req, res) {

    const consultationId = req.params.consultationId;

    const record = await MedicalRecord.findOne({
      consultation: consultationId
    });

    if (!record) {
      return res.notFound();
    }

    return res.json(record);
  }

};