const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `invoice_${invoice.id}_${Date.now()}.pdf`;
      
      // 1. Resolve path to the root of the Sails project, into .tmp/uploads/invoices
      const dirPath = path.join(process.cwd(), ".tmp", "uploads", "invoices");
      
      // 2. Safely create the directory if it does not exist yet
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // 3. Set the final file path
      const filePath = path.join(dirPath, fileName);

      // Initialize PDF Document
      const doc = new PDFDocument({ margin: 50 });
      const writeStream = fs.createWriteStream(filePath);
      
      doc.pipe(writeStream);

      // --- Write PDF Content ---

      // Header
      doc.fontSize(20).text("Medical Invoice", { align: "center" });
      doc.moveDown();

      // Patient & Doctor Info
      doc.fontSize(12);
      doc.text(`Invoice ID: ${invoice.id}`);
      doc.text(`Date: ${new Date(invoice.issueDate).toLocaleDateString()}`);
      doc.moveDown();
      doc.text(`Patient: ${invoice.patientName || "N/A"}`);
      doc.text(`Doctor: ${invoice.doctorName || "N/A"}`);
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Service Breakdown
      doc.fontSize(14).text("Services Provided:", { underline: true });
      doc.moveDown(0.5);
      
      doc.fontSize(12);
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach((item) => {
          doc.text(`${item.serviceName} - ₱${Number(item.price).toFixed(2)}`);
        });
      } else {
        doc.text("No itemized services recorded.");
      }
      doc.moveDown();

      // Divider
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
      doc.moveDown();

      // Totals
      doc.fontSize(14);
      doc.text(`Subtotal: ₱${Number(invoice.subtotal).toFixed(2)}`, { align: "right" });
      doc.text(`Final Total: ₱${Number(invoice.finalTotal).toFixed(2)}`, { align: "right", bold: true });

      // Finalize the PDF
      doc.end();

      // Resolve the promise ONLY when the file has finished writing to disk
      writeStream.on("finish", () => {
        resolve(filePath);
      });

      writeStream.on("error", (err) => {
        reject(err);
      });

    } catch (error) {
      console.error("Error generating PDF:", error);
      reject(error);
    }
  });
};

module.exports = {
  generateInvoicePDF,
};