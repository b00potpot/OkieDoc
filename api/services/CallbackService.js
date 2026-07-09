/**
 * CallbackService.js
 *
 * @description :: Encapsulates the core business logic for processing callback requests.
 */

module.exports = {
  // ---------------------------------------------------------------------------
  // 1. Start Callback
  // Changes: Waiting -> In Progress
  // ---------------------------------------------------------------------------
  startCallback: async function (callbackId) {
    if (!callbackId) {
      throw new Error('Callback ID is required.');
    }

    const callback = await CallbackRequest.findOne({ id: callbackId });
    if (!callback) {
      throw new Error('Callback not found.');
    }

    // Optional: Protect against starting callbacks that are already completed
    if (callback.status === 'Closed' || callback.status === 'Converted') {
      throw new Error(`Cannot start a callback that is already ${callback.status}.`);
    }

    const updatedCallback = await CallbackRequest.updateOne({ id: callbackId }).set({
      status: 'In Progress'
    });

    return updatedCallback;
  },

  // ---------------------------------------------------------------------------
  // 2. Escalate to Doctor
  // Creates consultation, assigns doctor, updates callback status, links ID
  // ---------------------------------------------------------------------------
  escalateToDoctor: async function (callbackId, assignedDoctorId) {
    if (!callbackId || !assignedDoctorId) {
      throw new Error('Both Callback ID and Doctor ID are required for escalation.');
    }

    const callback = await CallbackRequest.findOne({ id: callbackId });
    if (!callback) {
      throw new Error('Callback not found.');
    }

    // 1. Create the actual consultation ticket using your Consultation model
    // .fetch() is required in Sails to return the newly created record
    const consultation = await Consultation.create({
      patientId: callback.patientId,
      chiefComplaint: callback.chiefComplaint,
      symptoms: callback.symptoms,
      assignedDoctorId: assignedDoctorId,
      source: 'Callback Escalation' 
    }).fetch();

    // 2. Update the callback status and link the consultation ID
    const updatedCallback = await CallbackRequest.updateOne({ id: callbackId }).set({
      status: 'Escalated',
      assignedDoctorId: assignedDoctorId,
      consultationId: consultation.id
    });

    return { 
      callback: updatedCallback, 
      consultation 
    };
  },

  // ---------------------------------------------------------------------------
  // 3. Convert to Ticket
  // Creates consultation ticket, preserves data, returns consultation
  // ---------------------------------------------------------------------------
  convertToTicket: async function (callbackId) {
    if (!callbackId) {
      throw new Error('Callback ID is required.');
    }

    const callback = await CallbackRequest.findOne({ id: callbackId });
    if (!callback) {
      throw new Error('Callback not found.');
    }

    // 1. Create consultation ticket preserving the callback data
    const consultation = await Consultation.create({
      patientId: callback.patientId,
      chiefComplaint: callback.chiefComplaint,
      symptoms: callback.symptoms,
      source: 'Callback Conversion'
    }).fetch();

    // 2. Update the callback status and link the consultation ID
    const updatedCallback = await CallbackRequest.updateOne({ id: callbackId }).set({
      status: 'Converted', // Or 'Closed', depending on your exact workflow
      consultationId: consultation.id
    });

    return { 
      callback: updatedCallback, 
      consultation 
    };
  }
};