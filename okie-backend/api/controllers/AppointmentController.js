module.exports = {

  create: async function(req,res){

    const appointment =
      await Appointment.create(req.body)
      .fetch();

    return res.json(appointment);

  },

  findAll: async function(req,res){

    const appointments =
      await Appointment.find()
      .populate("patient")
      .populate("doctor");

    return res.json(appointments);

  }

};