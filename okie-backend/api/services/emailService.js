const nodemailer = require("nodemailer");

// B. Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Recommend using an App Password if using Gmail
  },
});

// C. Send Invoice Email
const sendInvoiceEmail = async ({ patientEmail, pdfPath, invoice }) => {
  try {
    const mailOptions = {
      from: `"Your Clinic Name" <${process.env.EMAIL_USER}>`,
      to: patientEmail,
      subject: `Your Medical Invoice - #${invoice.id}`,
      text: `Hello ${invoice.patientName || "Patient"},\n\nAttached is your medical invoice for your recent consultation.\n\nTotal Due: ₱${Number(invoice.finalTotal).toFixed(2)}\n\nThank you!`,
      html: `
        <h3>Hello ${invoice.patientName || "Patient"},</h3>
        <p>Attached is your medical invoice for your recent consultation.</p>
        <p><strong>Total Due:</strong> ₱${Number(invoice.finalTotal).toFixed(2)}</p>
        <br/>
        <p>Thank you!</p>
      `,
      attachments: [
        {
          filename: `Invoice_${invoice.id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: %s", info.messageId);
    
    return info;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    throw error;
  }
};

module.exports = {
  sendInvoiceEmail,
};