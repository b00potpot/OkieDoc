module.exports = {

  addRemarks: async function(req,res){

    const ticket =
      await ConsultationTicket.updateOne({
        id:req.params.id
      }).set({
        nurseRemarks:req.body.remarks
      });

    return res.json(ticket);

  },

 assignGP: async function (req, res) {

  try {

    const consultationId = req.params.id;

    if (!consultationId) {
      return res.badRequest({
        error: "Missing consultation id in URL"
      });
    }

    const consultation = await ConsultationTicket.findOne({
      id: consultationId
    });

    if (!consultation) {
      return res.notFound({
        error: "Consultation not found"
      });
    }

    const updated = await ConsultationTicket.updateOne({
      id: consultationId
    }).set({
      status: "Assigned"
    });

    return res.json({
      status: "Assigned",
      consultation: updated
    });

  } catch (err) {
    return res.serverError(err);
  }
}

};