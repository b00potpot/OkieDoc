module.exports = {
  attributes: {
    // --- Relationships ---
    consultationTicket: {
      model: "consultationticket",
      required: true
    },
    patient: {
      model: "patient",
      required: true
    },

    // --- Core Billing Information ---
    invoiceNumber: {
      type: "string",
      required: true,
      unique: true // Recommended: ensures no duplicate invoice IDs
    },
    consultationType: {
      type: "string"
    },
    services: {
      type: "json", // Stores arrays like ['Lab Request', 'Medical Certificate']
      defaultsTo: []
    },

    // --- Financials ---
    totalAmount: {
      type: "number",
      required: true
    },
    amountPaid: {
      type: "number",
      defaultsTo: 0
    },

    // --- Status & Lifecycle Tracking ---
    status: {
      type: "string",
      isIn: [
        "Pending",
        "Overdue",
        "Partially Paid",
        "Paid",
        "HMO Pending",
        "Payment Failed"
      ],
      defaultsTo: "Pending"
    },

    // --- Timestamps & Dates ---
    invoiceDate: {
      type: "string" // Typically stored as ISO string (YYYY-MM-DDTHH:mm:ss.sssZ)
    },
    dueDate: {
      type: "string"
    },
    lastReminderSent: {
      type: "string",
      allowNull: true // Nullable since newly generated invoices haven't had reminders sent yet
    },
    paymentDate: {
      type: "string",
      allowNull: true
    }
  }
};