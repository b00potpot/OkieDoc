module.exports = {


  create: async function(req,res){


    const ticket =
      await ConsultationTicket.create({


        ticketNumber:
          "T-" + Date.now(),


        patient:
          req.body.patient,


        chiefComplaint:
          req.body.chiefComplaint


      }).fetch();


    return res.json(ticket);


  },


  pending: async function(req,res){


    const data =
      await ConsultationTicket.find({
        status:"Waiting"
      });


    return res.json(data);


  },


  status: async function(req,res){


    const ticket =
      await ConsultationTicket.findOne({
        id:req.params.id
      });


    return res.json(ticket);


  }


};
