
module.exports = {
  create: async function (req, res) {
    try {
      // 1. Destructure fields from the request body
      const { consultation, patient, doctor, items } = req.body;

      // Validation check
      if (!consultation || !patient || !doctor) {
        return res.badRequest({ 
          message: 'Missing required prescription tracking fields (consultation, patient, or doctor).' 
        });
      }

      // 2. Wrap operations in a secure transaction block
      const finalizedPrescription = await sails.getDatastore().transaction(async (db) => {
        
        // 3. Create the master parent record
        const newPrescription = await Prescription.create({
          consultation,
          patient,
          doctor
        })
        .usingConnection(db)
        .fetch(); // fetch() returns the created object along with its new database id

        // 4. Check if nested medication items exist in the payload
        if (items && Array.isArray(items) && items.length > 0) {
          
          // Inject the newly generated parent ID into every item record
          const itemsWithParentId = items.map(item => ({
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            prescription: newPrescription.id // Link explicitly to parent container
          }));

          // 5. Bulk insert everything in one database execution round
          await PrescriptionItem.createEach(itemsWithParentId).usingConnection(db);
        }

        // Fetch everything compiled cleanly back to confirm delivery sequence
        return await Prescription.findOne({ id: newPrescription.id })
          .populate('items')
          .usingConnection(db);
      });

      // 6. Return a unified response payload to the React Native app
      return res.status(201).json(finalizedPrescription);

    } catch (error) {
      sails.log.error('Error encountered inside PrescriptionController.create:', error);
      return res.serverError({
        message: 'An unexpected internal crash blocked creating complete prescription package entries.',
        error: error.message
      });
    }
  }
};