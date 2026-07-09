const PDFDocument = require("pdfkit");

module.exports = {

  /**
   * GET /api/billing
   * Retrieves all billing records, optionally filtered by status query parameters
   */
  findAll: async function (req, res) {
    try {
      const status = req.query.status;
      let criteria = {};

      if (status) {
        criteria.status = status;
      }

      const billings = await Billing.find(criteria)
        .populate("patient")
        .populate("consultationTicket");

      return res.json(billings);
    } catch (err) {
      console.error("Find all billings error:", err);
      return res.serverError(err);
    }
  },

  /**
   * GET /api/billing/search
   * Performs cross-entity search on billings via invoice numbers or patient names
   */
  search: async function (req, res) {
    try {
      const q = req.query.q || '';

      // 1. Resolve matching patient entities by name first
      const patients = await Patient.find({
        fullName: {
          contains: q
        }
      });
      const patientIds = patients.map(p => p.id);

      // 2. Query billing records tracking either invoice number OR associated patient ID matrix arrays
      const billings = await Billing.find({
        or: [
          {
            invoiceNumber: {
              contains: q
            }
          },
          {
            patient: patientIds
          }
        ]
      })
        .populate("patient")
        .populate("consultationTicket");

      return res.json(billings);
    } catch (err) {
      console.error("Billing cross-search validation execution error:", err);
      return res.serverError(err);
    }
  },

  /**
   * PUT /api/billing/:id/pay
   * Marks a target billing invoice record as completed/paid in full
   */
  markPaid: async function (req, res) {
    try {
      const billingId = req.params.id;

      const billing = await Billing.findOne({ id: billingId });
      if (!billing) {
        return res.notFound({ error: "Billing tracking record footprint missing." });
      }

      const today = new Date().toISOString();

      const updated = await Billing.updateOne({ id: billingId })
        .set({
          status: "Paid",
          paymentDate: today,
          amountPaid: billing.totalAmount, // Map transaction totals seamlessly
        });

      return res.json(updated);
    } catch (err) {
      console.error("Mark paid invoice workflow execution error:", err);
      return res.serverError(err);
    }
  },

  /**
   * POST /api/billing/:id/followup
   * Records a history footprint snapshot tracking payment reminders sent to patients
   */
  followup: async function (req, res) {
    try {
      const billingId = req.params.id;

      const billing = await Billing.findOne({ id: billingId });
      if (!billing) {
        return res.notFound({ error: "Target invoice file missing." });
      }

      const today = new Date().toISOString();

      // 1. Spin up a tracking log inside the reminder history collection
      await BillingFollowup.create({
        billing: billingId,
        dateSent: today,
        remarks: req.body.remarks || "Payment reminder sent",
        sentBy: req.body.sentBy || "Nurse",
      });

      // 2. Append operational update timestamp tags back onto the original invoice index frame
      await Billing.updateOne({ id: billingId })
        .set({
          lastReminderSent: today,
        });

      return res.json({
        success: true,
        message: "Reminder recorded"
      });
    } catch (err) {
      console.error("Follow-up reminder ledger entry compilation failure:", err);
      return res.serverError(err);
    }
  },

  /**
   * POST /api/billing/:id/escalate
   * Escalates overdue billing tracking records to administrative task handlers
   */
  escalate: async function (req, res) {
    try {
      const billingId = req.params.id;

      // Ensure the billing record exists before throwing task objects into the database queue
      const billingExists = await Billing.findOne({ id: billingId });
      if (!billingExists) {
        return res.notFound({ error: "Target invoice file metadata not found." });
      }

      await AdminBillingTask.create({
        billing: billingId,
        reason: req.body.reason || "Overdue payment",
        assignedTo: "Admin Billing Team",
        status: "Open",
      });

      return res.json({
        success: true,
        message: "Escalated successfully",
      });
    } catch (err) {
      console.error("Administrative operations queue routing allocation error:", err);
      return res.serverError(err);
    }
  },

  /**
   * POST /api/billing/:id/resend
   * Re-emits an active payment gateway reference indicator link tracking context
   */
  resendLink: async function (req, res) {
    try {
      const billingId = req.params.id;

      const billing = await Billing.findOne({ id: billingId });
      if (!billing) {
        return res.notFound({ error: "Target invoice database configuration reference missing." });
      }

      const today = new Date().toISOString();

      await Billing.updateOne({ id: billingId })
        .set({
          lastReminderSent: today
        });

      return res.json({
        success: true,
        message: "Invoice link resent"
      });
    } catch (err) {
      console.error("Resend invoicing link tracking transaction distribution failure:", err);
      return res.serverError(err);
    }
  },

  /**
   * GET /api/billing/export
   * Generates a downloadable PDF stream compilation compiling all system financial ledgers
   */
  export: async function (req, res) {
    try {
      const billings = await Billing.find()
        .populate("patient")
        .populate("consultationTicket");

      const doc = new PDFDocument({
        margin: 40,
        size: "A4",
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="billing-report.pdf"');

      doc.pipe(res);

      // Title layout construction context properties
      doc
        .fontSize(20)
        .text("Billing Report", {
          align: "center",
        });

      doc.moveDown();

      doc
        .fontSize(12)
        .text(`Generated: ${new Date().toLocaleString()}`);

      doc.moveDown(2);

      // Render out sequential transaction rows
      billings.forEach((billing, index) => {
        doc
          .fontSize(14)
          .text(`${index + 1}. ${billing.invoiceNumber || 'N/A'}`);

        doc
          .fontSize(11)
          .text(
            `Patient: ${
              billing.patient
                ? `${billing.patient.firstName || ''} ${billing.patient.lastName || ''}`.trim()
                : "Unknown"
            }`
          );

        doc.text(`Status: ${billing.status}`);
        doc.text(`Consultation Type: ${billing.consultationType || "N/A"}`);
        doc.text(`Amount: ₱${billing.totalAmount || 0}`);
        doc.text(`Invoice Date: ${billing.invoiceDate || "-"}`);
        doc.text(`Payment Date: ${billing.paymentDate || "-"}`);

        doc.moveDown();

        // Structural canvas grid rules divider lines mapping
        doc.moveTo(40, doc.y)
          .lineTo(550, doc.y)
          .stroke();

        doc.moveDown();
      });

      doc.end();

    } catch (err) {
      console.error("PDF generation export operation system exception:", err);
      return res.serverError(err);
    }
  }

};