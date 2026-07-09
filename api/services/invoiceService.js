// A. Calculate Totals (Pure JavaScript, framework agnostic)
const calculateTotals = (consultationFee = 0, services = [], customServices = []) => {
  const additionalTotal = services
    .filter((s) => s.checked)
    .reduce((sum, s) => sum + Number(s.price), 0);

  const customTotal = customServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  const subtotal = consultationFee + additionalTotal + customTotal;

  return {
    subtotal,
    finalTotal: subtotal, // Add tax or discount logic here later if needed
  };
};

// F. Create Audit Log 
const createHistoryLog = async ({ invoiceId, action, performedBy, notes = "" }) => {
  try {
    // Waterline: Requires .fetch() to return the newly created record
    return await InvoiceHistory.create({
      invoiceId,
      action,
      performedBy,
      notes,
      timestamp: new Date(),
    }).fetch(); 
  } catch (error) {
    console.error("Error creating history log:", error);
    throw error;
  }
};

// B. Create Invoice
const createInvoice = async (data) => {
  try {
    const { consultationId, patientId, doctorId, consultationFee, services, customServices, performedBy } = data;

    // 1. Compute totals
    const { subtotal, finalTotal } = calculateTotals(consultationFee, services, customServices);

    // 2. Create invoice row
    const invoice = await Invoice.create({
      consultationId,
      patientId,
      doctorId,
      subtotal,
      finalTotal,
      status: "UNPAID",
      issueDate: new Date(),
    }).fetch(); // Waterline: Needs .fetch()

    // 3. Create invoice items (combining standard and custom services)
    const allItems = [
      ...services.filter(s => s.checked).map(s => ({ invoiceId: invoice.id, serviceName: s.name, price: s.price, type: 'STANDARD' })),
      ...customServices.map(s => ({ invoiceId: invoice.id, serviceName: s.name, price: s.price, type: 'CUSTOM' }))
    ];
   
    if (allItems.length > 0) {
      // Waterline: Uses createEach instead of bulkCreate
      await InvoiceItem.createEach(allItems); 
    }

    // 4. Create history log
    await createHistoryLog({
      invoiceId: invoice.id,
      action: "CREATED",
      performedBy,
    });

    return invoice;
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error; 
  }
};

// C. Update Invoice
const updateInvoice = async (invoiceId, data) => {
  try {
    const { status, performedBy } = data;
   
    // Waterline: updateOne applies the update and returns the mutated record
    const invoice = await Invoice.updateOne({ id: invoiceId }).set({ status });
    
    if (!invoice) throw new Error("Invoice not found");

    await createHistoryLog({
      invoiceId: invoice.id,
      action: `UPDATED_STATUS_TO_${status}`,
      performedBy,
    });

    return invoice;
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

// D. Get Invoice By Consultation
const getInvoiceByConsultation = async (consultationId) => {
  try {
    // Waterline: Uses .populate() for relationship joins instead of Sequelize's 'include'
    return await Invoice.findOne({ consultationId })
                        .populate('items'); 
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

// E. Billing History
const getBillingHistory = async (consultationId) => {
  try {
    const invoice = await Invoice.findOne({ consultationId });
    if (!invoice) return [];

    // Waterline: Uses .find() for multiple records and .sort() for ordering
    return await InvoiceHistory.find({ invoiceId: invoice.id })
                               .sort('timestamp DESC'); 
  } catch (error) {
    console.error("Error fetching billing history:", error);
    throw error;
  }
};

module.exports = {
  createInvoice,
  updateInvoice,
  getInvoiceByConsultation,
  getBillingHistory,
  calculateTotals,
  createHistoryLog,
};