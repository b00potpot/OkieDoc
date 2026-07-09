module.exports = {

  create: async function(req,res){

    const lab =
      await LaboratoryRequest.create(req.body)
      .fetch();

    return res.json(lab);

  }

};