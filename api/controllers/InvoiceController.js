const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");

module.exports = {
  /**
   * A. Create Invoice
   * Responsibilities: create invoice, create invoice items, compute totals, create history audit, attach consultation
   */
  createInvoice: async function (req, res) {
    try {
      const { consultationId, patientId, items, notes } = req.body;

      // 1. Compute Totals
      let subtotal = 0;
      const processedItems = items.map(item => {
        const itemTotal = item.quantity * item.unitPrice;
        subtotal += itemTotal;
        return { ...item, total: itemTotal };
      });

      const taxRate = 0.12; // Example 12% tax
      const taxAmount = subtotal * taxRate;
      const grandTotal = subtotal + taxAmount;

      // 2. Create Invoice
      // In Waterline, use .fetch() if you need the generated record back (like the ID)
      const newInvoice = await Invoice.create({
        consultationId,
        patientId,
        subtotal,
        taxAmount,
        total: grandTotal,
        status: "Unpaid",
        notes
      }).fetch();

      // 3. Create Invoice Items
      const invoiceItemsData = processedItems.map(item => ({
        ...item,
        invoice: newInvoice.id // Note: Make sure your InvoiceItem model refers to the association as 'invoice' or 'invoiceId'
      }));
      
      // Waterline uses .createEach() instead of .bulkCreate()
      await InvoiceItem.createEach(invoiceItemsData);

      // 4. Attach to Consultation
      // Waterline uses .updateOne()
      await Consultation.updateOne({ id: consultationId }).set({ 
        invoiceId: newInvoice.id 
      });

      // 5. Create History Audit
      await InvoiceHistory.create({
        invoice: newInvoice.id,
        action: "INVOICE_CREATED",
        performedBy: req.session?.userId || "System", // Adjusted for standard Sails session auth
        details: "Initial invoice generated."
      });

      return res.status(201).json({
        success: true,
        message: "Invoice created successfully",
        data: newInvoice
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
      return res.serverError({ success: false, message: "Internal server error" });
    }
  },

  /**
   * B. Get Invoice By Consultation
   * Used when modal opens.
   */
  getInvoiceByConsultation: async function (req, res) {
    try {
      const { consultationId } = req.params;

      // Waterline uses .populate() instead of Sequelize's include array
      const invoice = await Invoice.findOne({ consultationId })
        .populate("items")
        .populate("history");

      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      return res.status(200).json({ success: true, data: invoice });
    } catch (error) {
      console.error("Error fetching invoice:", error);
      return res.serverError({ success: false, message: "Internal server error" });
    }
  },

  /**
   * C. Update Invoice
   * Needed when nurse edits services/payment status.
   */
  updateInvoice: async function (req, res) {
    try {
      const { id } = req.params;
      const { status, paymentMethod, notes, amountPaid } = req.body;

      // Waterline: use findOne instead of findByPk
      const invoice = await Invoice.findOne({ id });
      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      // Calculate updates
      let updateData = {
        status: status || invoice.status,
        paymentMethod: paymentMethod || invoice.paymentMethod,
        notes: notes || invoice.notes
      };

      if (amountPaid) {
        updateData.amountPaid = (invoice.amountPaid || 0) + amountPaid;
        if (updateData.amountPaid >= invoice.total) {
          updateData.status = "Paid";
        }
      }

      // Waterline: use updateOne().set() to save changes
      const updatedInvoice = await Invoice.updateOne({ id }).set(updateData);

      // Create Audit Log
      await InvoiceHistory.create({
        invoice: invoice.id,
        action: "INVOICE_UPDATED",
        performedBy: req.session?.userId || "Staff",
        details: `Invoice status updated to ${updateData.status}`
      });

      return res.status(200).json({
        success: true,
        message: "Invoice updated successfully",
        data: updatedInvoice
      });
    } catch (error) {
      console.error("Error updating invoice:", error);
      return res.serverError({ success: false, message: "Internal server error" });
    }
  },

  /**
   * D. Get Billing History
   */
  getInvoiceHistory: async function (req, res) {
    try {
      const { id } = req.params;

      // Waterline uses .sort() with a string instead of nested arrays
      const history = await InvoiceHistory.find({ invoice: id }).sort("createdAt DESC");

      return res.status(200).json({ success: true, data: history });
    } catch (error) {
      console.error("Error fetching invoice history:", error);
      return res.serverError({ success: false, message: "Internal server error" });
    }
  },

  /**
   * E. Generate PDF
   */
  generateInvoicePDF: async function (req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findOne({ id }).populate("items");

      if (!invoice) {
        return res.status(404).json({ success: false, message: "Invoice not found" });
      }

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename=Invoice-${invoice.id}.pdf`);
      doc.pipe(res);

      doc.fontSize(20).text("CLINIC INVOICE", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Invoice ID: ${invoice.id}`);
      doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
      doc.text(`Status: ${invoice.status}`);
      doc.moveDown();

      doc.fontSize(12).text("Items:", { underline: true });
      doc.moveDown(0.5);

      invoice.items.forEach(item => {
        doc.text(`${item.description || 'Service'} (x${item.quantity}) - $${item.total.toFixed(2)}`);
      });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      doc.fontSize(14).text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, { align: "right" });
      doc.text(`Tax: $${invoice.taxAmount.toFixed(2)}`, { align: "right" });
      doc.fontSize(16).text(`Total: $${invoice.total.toFixed(2)}`, { align: "right" });

      doc.end();

    } catch (error) {
      console.error("Error generating PDF:", error);
      if (!res.headersSent) {
        return res.serverError({ success: false, message: "Internal server error" });
      }
    }
  },

  /**
   * F. Send Invoice Email
   */
  sendInvoiceEmail: async function (req, res) {
    try {
      const { id } = req.params;

      const invoice = await Invoice.findOne({ id }).populate("patientId");

      if (!invoice || !invoice.patientId) {
        return res.status(404).json({ success: false, message: "Invoice or Patient not found" });
      }

      const patient = invoice.patientId; // Data populated from the model

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true, 
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const mailOptions = {
        from: `"Clinic Billing" <${process.env.SMTP_USER}>`,
        to: patient.email,
        subject: `Your Invoice from Clinic (ID: ${invoice.id})`,
        text: `Dear ${patient.fullName || 'Patient'}, \n\nYour invoice for consultation is ready. The total amount is $${invoice.total}. Current status: ${invoice.status}.\n\nThank you!`,
        html: `<p>Dear ${patient.fullName || 'Patient'},</p>
               <p>Your invoice for the recent consultation is ready.</p>
               <ul>
                 <li><b>Total Amount:</b> $${invoice.total}</li>
                 <li><b>Status:</b> ${invoice.status}</li>
               </ul>
               <p>Thank you!</p>`
      };

      await transporter.sendMail(mailOptions);

      await InvoiceHistory.create({
        invoice: invoice.id,
        action: "EMAIL_SENT",
        performedBy: req.session?.userId || "System",
        details: `Invoice emailed to ${patient.email}`
      });

      return res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      return res.serverError({ success: false, message: "Failed to send email" });
    }
  }
};