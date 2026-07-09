module.exports = {

  create: async function(req, res) {

    const soap = await SOAPNote.create(req.body)
      .fetch();

    return res.json(soap);
  },

  findAll: async function(req, res) {

    const soap = await SOAPNote.find();

    return res.json(soap);
  },

  findByConsultation: async function(req, res) {

    const consultationId = req.params.consultationId;

    const soap = await SOAPNote.find({
      consultation: consultationId
    });


    return res.json(soap);
  }

};