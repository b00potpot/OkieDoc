module.exports = {

  // ==========================================
  // GET /followups?page=1&limit=20
  // Fetch Follow-Ups with Pagination
  // ==========================================
  find: async function (req, res) {
    try {
      const page = Math.max(0, (parseInt(req.query.page, 10) || 1) - 1);
      const limit = parseInt(req.query.limit, 10) || 20;

      const [list, totalCount] = await Promise.all([
        FollowUp.find()
          .populate('patient')
          .skip(page * limit)
          .limit(limit),
        FollowUp.count()
      ]);

      return res.json({
        data: list,
        meta: {
          currentPage: page + 1,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit)
        }
      });
    } catch (err) {
      console.error("Find follow-ups error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // GET /followups/unread-count
  // Get Global or User-Specific Unread Count
  // ==========================================
  unreadCount: async function (req, res) {
    try {
      // Build criteria: Default to fetching all unread
      let criteria = { status: 'Unread' };

      // If an authenticated user exists, scope the count to them specifically
      if (req.user && req.user.id) {
        criteria.assignedDoctorId = req.user.id;
      }

      const count = await FollowUp.count(criteria);
     
      return res.json({ unreadCount: count });
    } catch (err) {
      console.error("Unread count error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // GET /specialists/:id/available-slots
  // Temporarily housed here before moving to SchedulingController
  // ==========================================
  availableSlots: async function (req, res) {
    try {
      const { id } = req.params;
     
      // TODO: Replace with actual database query to your Calendar/Availability model
      // Returning mock structure for frontend integration testing
      const slots = [
        { date: '2026-06-15', times: ['09:00', '10:00', '14:00'] },
        { date: '2026-06-16', times: ['11:00', '13:00', '15:30'] }
      ];

      return res.json({
        specialistId: id,
        availableSlots: slots
      });
    } catch (err) {
      console.error("Available slots error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // PATCH /followups/:id/extend
  // ==========================================
  extend: async function (req, res) {
    try {
      const { id } = req.params;
      const { days, reason } = req.body;

      if (!days) return res.badRequest({ error: "Days parameter is required." });

      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      // Calculate the new expiration date dynamically
      const currentExpDate = new Date(followUp.expiresAt || followUp.expirationDate || Date.now());
      currentExpDate.setDate(currentExpDate.getDate() + parseInt(days, 10));
      const newExpirationDate = currentExpDate.toISOString();

      const updated = await FollowUp.updateOne({ id }).set({
        expiresAt: newExpirationDate,
        lastActivityDate: new Date().toISOString()
      });

      // Add audit log
      await FollowUpActivityLog.create({
        followUp: id,
        action: `Extended by ${days} days. Reason: ${reason || 'Patient requested additional monitoring'}`,
        performedBy: req.user?.id || req.body.performedBy || 1
      });

      return res.json(updated);
    } catch (err) {
      console.error("Extend follow-up error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // PATCH /followups/:id/close
  // ==========================================
  close: async function (req, res) {
    try {
      const { id } = req.params;
     
      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      const updated = await FollowUp.updateOne({ id }).set({
        status: 'Closed',
        isClosed: true,
        closedAt: new Date().toISOString(),
        lastActivityDate: new Date().toISOString()
      });

      // Log the closure
      await FollowUpActivityLog.create({
        followUp: id,
        action: "FOLLOW_UP_CLOSED",
        performedBy: req.user?.id || req.body.performedBy || 1
      });

      return res.json(updated);
    } catch (err) {
      console.error("Close follow-up error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // PATCH /followups/:id/reopen
  // ==========================================
  reopen: async function (req, res) {
    try {
      const { id } = req.params;

      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      const updated = await FollowUp.updateOne({ id }).set({
        status: 'Replied',
        isClosed: false,
        reopenedAt: new Date().toISOString(),
        lastActivityDate: new Date().toISOString()
      });

      // Log the reopen action
      await FollowUpActivityLog.create({
        followUp: id,
        action: "FOLLOW_UP_REOPENED",
        performedBy: req.user?.id || req.body.performedBy || 1
      });

      return res.json(updated);
    } catch (err) {
      console.error("Reopen follow-up error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // PATCH /followups/:id/refer
  // ==========================================
  refer: async function (req, res) {
    try {
      const { id } = req.params;
      const { doctorId } = req.body;

      if (!doctorId) return res.badRequest({ error: "DoctorId is required." });

      // Populate assignedDoctorId to get the old doctor's name
      const followUp = await FollowUp.findOne({ id }).populate('assignedDoctorId');
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      const oldDoctorName = followUp.assignedDoctorId ? followUp.assignedDoctorId.fullName : "Unassigned";

      // Reassign to the new doctor
      const updated = await FollowUp.updateOne({ id }).set({
        assignedDoctorId: doctorId,
        lastActivityDate: new Date().toISOString()
      });

      // Fetch the newly assigned doctor to construct a clean log string
      const newDoctor = await Doctor.findOne({ id: doctorId });
      const newDoctorName = newDoctor ? newDoctor.fullName : "Unknown";

      // Dynamic audit logging
      await FollowUpActivityLog.create({
        followUp: id,
        action: `SPECIALIST_CHANGED: Referred from Dr. ${oldDoctorName} to Dr. ${newDoctorName}`,
        performedBy: req.user?.id || req.body.performedBy || 1
      });

      return res.json(updated);
    } catch (err) {
      console.error("Refer follow-up error:", err);
      return res.serverError(err);
    }
  },

  // ==========================================
  // POST /followups/:id/schedule
  // ==========================================
  schedule: async function (req, res) {
    try {
      const { id } = req.params;
      const { doctorId, dateTime } = req.body; // e.g., "2026-06-15T14:00"

      if (!doctorId || !dateTime) {
        return res.badRequest({ error: "doctorId and dateTime are required." });
      }

      const followUp = await FollowUp.findOne({ id });
      if (!followUp) return res.notFound({ error: "Follow-up record not found." });

      // Parse incoming ISO datetime into split fields for your ConsultationTicket model
      const dateObj = new Date(dateTime);
      const appointmentDate = dateObj.toISOString().split('T')[0]; // "YYYY-MM-DD"
      const appointmentTime = dateObj.toTimeString().substring(0, 5); // "HH:mm"

      // Create a fresh ConsultationTicket using the parent FollowUp data
      const newConsultation = await ConsultationTicket.create({
        patient: followUp.patient,
        specialist: doctorId,      
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        consultationType: 'Specialist Consultation',
        status: 'Pending Triage',
        isDraft: false
      }).fetch();

      // Log the ticket linkage into the follow-up history
      await FollowUpActivityLog.create({
        followUp: id,
        action: `CONSULTATION_SCHEDULED: Generated Ticket ${newConsultation.ticketNumber}`,
        performedBy: req.user?.id || req.body.performedBy || 1
      });

      return res.status(201).json({
        message: "Follow-up scheduled successfully.",
        followUpId: id,
        newConsultation
      });
    } catch (err) {
      console.error("Schedule follow-up error:", err);
      return res.serverError(err);
    }
  }
};