
module.exports = {
  // ---------------------------------------------------------------------------
  // A. Get All Callbacks
  // Used by Callback page table.
  // ---------------------------------------------------------------------------
  getAllCallbacks: async function (req, res) {
    try {
      const callbacks = await CallbackRequest.find().sort('createdAt DESC');
      return res.json({ success: true, data: callbacks });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to fetch callbacks', error });
    }
  },

  // ---------------------------------------------------------------------------
  // B. Get Single Callback
  // Used when opening modal.
  // ---------------------------------------------------------------------------
  getCallbackById: async function (req, res) {
    try {
      const id = req.param('id');
      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      const callback = await CallbackRequest.findOne({ id });
      if (!callback) return res.notFound({ success: false, message: 'Callback not found' });

      return res.json({ success: true, data: callback });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to fetch callback', error });
    }
  },

  // ---------------------------------------------------------------------------
  // C. Update Callback Notes
  // Updates: symptoms, nurseRemarks, callbackNotes
  // ---------------------------------------------------------------------------
  updateCallback: async function (req, res) {
    try {
      const id = req.param('id');
      const { symptoms, nurseRemarks, callbackNotes } = req.body;

      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        symptoms,
        nurseRemarks,
        callbackNotes
      });

      if (!updatedCallback) return res.notFound({ success: false, message: 'Callback not found' });

      return res.json({ success: true, data: updatedCallback });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to update callback notes', error });
    }
  },

  // ---------------------------------------------------------------------------
  // D. Start Callback
  // Changes: Waiting -> In Progress
  // Triggered by: Start, View, View Details
  // ---------------------------------------------------------------------------
  startCallback: async function (req, res) {
    try {
      const id = req.param('id');
      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      // Assuming we check the current status, though updateOne can just overwrite
      const callback = await CallbackRequest.findOne({ id });
      if (!callback) return res.notFound({ success: false, message: 'Callback not found' });

      // Only transition if it's currently 'Waiting' (optional logic, adjust as needed)
      if (callback.status !== 'Waiting') {
        return res.badRequest({ success: false, message: `Cannot start callback with status: ${callback.status}` });
      }

      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        status: 'In Progress'
      });

      return res.json({ success: true, data: updatedCallback });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to start callback', error });
    }
  },

  // ---------------------------------------------------------------------------
  // E. Mark as Inquiry
  // Changes: status = Inquiry
  // ---------------------------------------------------------------------------
  markAsInquiry: async function (req, res) {
    try {
      const id = req.param('id');
      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        status: 'Inquiry'
      });

      if (!updatedCallback) return res.notFound({ success: false, message: 'Callback not found' });

      return res.json({ success: true, data: updatedCallback });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to mark as inquiry', error });
    }
  },

  // ---------------------------------------------------------------------------
  // F. Escalate to Doctor
  // Changes: status = Escalated, creates consultation ticket, assigns to doctor
  // ---------------------------------------------------------------------------
  escalateToDoctor: async function (req, res) {
    try {
      const id = req.param('id');
      const { assignedDoctorId } = req.body;

      if (!id) return res.badRequest({ success: false, message: 'ID is required' });
      if (!assignedDoctorId) return res.badRequest({ success: false, message: 'Doctor ID is required for escalation' });

      const callback = await CallbackRequest.findOne({ id });
      if (!callback) return res.notFound({ success: false, message: 'Callback not found' });

      // 1. Create the consultation ticket (Assuming you have a global ConsultationService)
      const consultationTicket = await ConsultationService.createTicket({
        patientId: callback.patientId,
        chiefComplaint: callback.chiefComplaint,
        symptoms: callback.symptoms,
        assignedDoctorId: assignedDoctorId,
        source: 'Callback Escalation'
      });

      // 2. Update the Callback status and link it
      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        status: 'Escalated',
        assignedDoctorId: assignedDoctorId,
        consultationId: consultationTicket.id 
      });

      return res.json({ success: true, data: { callback: updatedCallback, consultation: consultationTicket } });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to escalate to doctor', error });
    }
  },

  // ---------------------------------------------------------------------------
  // G. Convert to Ticket
  // Creates actual consultation ticket (Reusing ConsultationService)
  // ---------------------------------------------------------------------------
  convertToTicket: async function (req, res) {
    try {
      const id = req.param('id');
      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      const callback = await CallbackRequest.findOne({ id });
      if (!callback) return res.notFound({ success: false, message: 'Callback not found' });

      // Create consultation ticket without strictly assigning a doctor immediately 
      const consultationTicket = await ConsultationService.createTicket({
        patientId: callback.patientId,
        chiefComplaint: callback.chiefComplaint,
        symptoms: callback.symptoms,
        source: 'Callback Conversion'
      });

      // Update callback to link the new consultation ID
      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        consultationId: consultationTicket.id,
        status: 'Converted' // Optional: if you have a converted status, otherwise omit this line
      });

      return res.json({ success: true, data: { callback: updatedCallback, consultation: consultationTicket } });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to convert to ticket', error });
    }
  },

  // ---------------------------------------------------------------------------
  // H. Mark as Completed
  // Changes: status = Closed
  // ---------------------------------------------------------------------------
  markAsCompleted: async function (req, res) {
    try {
      const id = req.param('id');
      if (!id) return res.badRequest({ success: false, message: 'ID is required' });

      const updatedCallback = await CallbackRequest.updateOne({ id }).set({
        status: 'Closed'
      });

      if (!updatedCallback) return res.notFound({ success: false, message: 'Callback not found' });

      return res.json({ success: true, data: updatedCallback });
    } catch (error) {
      return res.serverError({ success: false, message: 'Failed to mark as completed', error });
    }
  }
};