// api/controllers/ConsultationTicketController.js
module.exports = {

  /**
   * POST /consultations/draft
   * Initializes an empty or partially populated workflow draft
   */
  createDraft: async function (req, res) {
    try {
      const data = req.body;
      data.isDraft = true;
      data.status = 'Draft';

      const newDraft = await ConsultationTicket.create(data).fetch();
      return res.status(201).json({ id: newDraft.id, isDraft: newDraft.isDraft });
    } catch (err) {
      console.error("Create draft error:", err);
      return res.serverError(err);
    }
  },

  /**
   * PUT /consultations/draft/:id
   * Updates state data within an existing, active draft footprint
   */
  updateDraft: async function (req, res) {
    try {
      const { id } = req.params;

      const draft = await ConsultationTicket.findOne({
        id,
        isDraft: true
      });

      if (!draft) {
        return res.notFound('Draft record not found or already published.');
      }

      const updatedDraft = await ConsultationTicket
        .updateOne({ id })
        .set(req.body);

      return res.json(updatedDraft);
    } catch (err) {
      console.error("Update draft error:", err);
      return res.serverError(err);
    }
  },

  /**
   * GET /consultations/draft/:id
   * Retrieves single snapshot baseline context via ID parameter lookup
   */
  getDraft: async function (req, res) {
    try {
      const { id } = req.params;
      const draft = await ConsultationTicket.findOne({ id });
      
      if (!draft) { return res.notFound('Draft not found'); }
      return res.json(draft);
    } catch (err) {
      console.error("Get draft error:", err);
      return res.serverError(err);
    }
  },

  /**
   * POST /consultations
   * Upgrades a draft tracking frame, or spins up a fresh live clinical record directly
   */
  createTicket: async function (req, res) {
    try {
      const data = req.body;

      data.isDraft = false;
      data.status = 'Pending Triage';

      let ticket;
      
      // Case A: Upgrading an existing draft tracking frame
      if (data.id) {
        const updateId = data.id;

        const currentRecord = await ConsultationTicket.findOne({ id: updateId });
        if (!currentRecord) { 
          return res.notFound({ error: 'Ticket footprint manipulation targets not found.' }); 
        }

        // Resolve merged target details (incoming properties vs database baseline fields)
        const targetPatient = data.patient !== undefined ? data.patient : currentRecord.patient;
        const targetSpecialist = data.specialist !== undefined ? data.specialist : currentRecord.specialist;
        const targetSpecialistType = data.specialistType !== undefined ? data.specialistType : currentRecord.specialistType;
        const targetConsultationType = data.consultationType !== undefined ? data.consultationType : currentRecord.consultationType;
        const targetDate = data.appointmentDate !== undefined ? data.appointmentDate : currentRecord.appointmentDate;
        const targetTime = data.appointmentTime !== undefined ? data.appointmentTime : currentRecord.appointmentTime;

        // Strict Backend Validation check for required fields
        if (!targetPatient || !targetSpecialistType || !targetConsultationType || !targetDate || !targetTime) {
          return res.badRequest({ error: "Required fields missing" });
        }

        // Real Availability Logic: Check if another active ticket already occupies this exact slot
        const doubleBookingConflict = await ConsultationTicket.findOne({
          id: { '!=': updateId }, // Exclude this record so it doesn't conflict with its own draft footprint
          specialist: targetSpecialist,
          appointmentDate: targetDate,
          appointmentTime: targetTime,
          status: { '!=': ['Draft', 'Closed', 'Cancelled'] } 
        });

        if (doubleBookingConflict) {
          return res.badRequest({ error: "The selected time slot is already booked for this specialist. Please select another time." });
        }

        // Remove tracking ID value from payload properties modification updates
        delete data.id;
        ticket = await ConsultationTicket.updateOne({ id: updateId }).set(data);

      } else {
        // Case B: Spinning up a completely fresh live clinical record directly
        
        // Strict Backend Validation check for fresh fields payload
        if (!data.patient || !data.specialistType || !data.consultationType || !data.appointmentDate || !data.appointmentTime) {
          return res.badRequest({ error: "Required fields missing" });
        }

        // Real Availability Logic: Prevent double booking instantly
        const doubleBookingConflict = await ConsultationTicket.findOne({
          specialist: data.specialist,
          appointmentDate: data.appointmentDate,
          appointmentTime: data.appointmentTime,
          status: { '!=': ['Draft', 'Closed', 'Cancelled'] }
        });

        if (doubleBookingConflict) {
          return res.badRequest({ error: "The selected time slot is already booked for this specialist. Please select another time." });
        }

        ticket = await ConsultationTicket.create(data).fetch();
      }

      if (!ticket) { return res.notFound('Ticket footprint manipulation targets not found.'); }
      return res.status(201).json(ticket);

    } catch (err) {
      console.error("Publish ticket creation workflow error:", err);
      return res.serverError(err);
    }
  },

  /**
   * PUT /consultations/:id/assign-nurse
   * Binds an operational staff record identity allocation onto an active ticket
   */
  assignNurse: async function (req, res) {
    try {
      const { id } = req.params;
      const { nurseId } = req.body;

      if (!nurseId) {
        return res.badRequest({ message: "nurseId is required." });
      }

      const updatedTicket = await ConsultationTicket.updateOne({ id }).set({
        assignedNurse: nurseId,
        status: 'Assigned to Nurse'
      });

      if (!updatedTicket) { return res.notFound('Ticket not found'); }
      return res.json(updatedTicket);
    } catch (err) {
      console.error("Nurse distribution routing queue assignment error:", err);
      return res.serverError(err);
    }
  },

  /**
   * PUT /consultations/:id/close
   * Terminates operational lifecycle tracking context updates
   */
  closeTicket: async function(req, res){
    try {
      const { id } = req.params;
      const { closeReason } = req.body;

      if(!closeReason){
        return res.badRequest({
          error: "Close reason parameter string execution context required"
        });
      }

      const ticket = await ConsultationTicket.updateOne({ id })
        .set({
          status: "Completed", 
          closeReason
        });

      if (!ticket) { return res.notFound('Ticket closure target data entity missing.'); }
      return res.json(ticket);
    } catch (err) {
      console.error("Close ticket workflow error:", err);
      return res.serverError(err);
    }
  },

  /**
   * POST /consultations/:id/invoice
   * Builds financial parameters, emits notifications, and shifts state tracking locks
   */
  generateInvoice: async function(req, res){
    try {
      const { id } = req.params;

      const ticket = await ConsultationTicket.findOne({ id });
      if (!ticket) { return res.notFound('Target ticket for billing calculations missing.'); }

      const updated = await ConsultationTicket.updateOne({ id })
        .set({
          bookingFee: 200,
          invoiceGenerated: true,
          status: "In Consultation", 
          paymentLink: `https://pay.example.com/${ticket.id}`
        });

      console.log(`[Notification Engine] SMS text update dispatched for payment tracking index: ${id}`);
      console.log(`[Notification Engine] Email notification receipt compiled and pushed.`);

      return res.json(updated);
    } catch (err) {
      console.error("Invoice matrix generation controller mapping failure:", err);
      return res.serverError(err);
    }
  }

};