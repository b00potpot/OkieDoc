import React, { useState, useEffect } from "react";
import api from '../../services/api';


const InvoiceModal = ({
  isOpen,
  onClose,
  invoiceData,
  selectedConsultation
}) => {
  // If modal is not open or data is missing, don't render
  if (!isOpen || !invoiceData) return null;


  // ==========================================
  // E. Local State For Editable Invoice
  // ==========================================
  const [paymentType, setPaymentType] = useState(invoiceData.paymentType || "Private");
  const [paymentStatus, setPaymentStatus] = useState("Pending");


  const [services, setServices] = useState([
    { id: "cert", label: "Medical Certificate", price: 200, checked: false },
    { id: "clearance", label: "Medical Clearance", price: 300, checked: false },
    { id: "lab", label: "Lab Request", price: 150, checked: false },
    { id: "plan", label: "Treatment Plan", price: 250, checked: false },
    { id: "specialist", label: "Specialist Add-on Fee", price: 500, checked: false },
    { id: "followup", label: "Follow-up Consultation", price: 400, checked: false },
  ]);


  // ==========================================
  // F. Custom Services State
  // ==========================================
  const [customServices, setCustomServices] = useState([]);
  const [customServiceName, setCustomServiceName] = useState("");
  const [customServicePrice, setCustomServicePrice] = useState("");


  const addCustomService = () => {
    if (customServiceName.trim() !== "" && customServicePrice !== "") {
      const newService = {
        id: Date.now().toString(),
        label: customServiceName,
        price: Number(customServicePrice),
        checked: true
      };
      setCustomServices([...customServices, newService]);
      setCustomServiceName("");
      setCustomServicePrice("");
    }
  };


  const handleServiceToggle = (id) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    );
  };


  const handlePriceChange = (id, newPrice) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, price: Number(newPrice) } : s))
    );
  };


  // ==========================================
  // G. Compute Totals Dynamically
  // ==========================================
  const consultationFee = invoiceData?.consultationFee || 500; // Defaulting to 500 if missing


  const additionalTotal = services
    .filter((s) => s.checked)
    .reduce((sum, s) => sum + Number(s.price), 0);


  const customTotal = customServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );


  const subtotal = consultationFee + additionalTotal + customTotal;
  const finalTotal = subtotal;


  // ==========================================
  // H. Save Invoice
  // ==========================================
  const saveInvoice = async () => {
    try {
      // Combine predefined checked services with custom services
      const allBillableItems = [
        ...services.filter(s => s.checked),
        ...customServices
      ];


      /* Uncomment when API is ready
      await api.post("/invoices", {
        consultationId: selectedConsultation.dbId,
        paymentType,
        paymentStatus,
        services: allBillableItems,
        subtotal,
        finalTotal,
      });
      */
      console.log("Invoice Saved:", { subtotal, finalTotal, paymentType, paymentStatus });
      onClose(); // Close after saving
    } catch (error) {
      console.error("Failed to save invoice:", error);
    }
  };


  // ==========================================
  // I. Download PDF
  // ==========================================
  const downloadPDF = async () => {
    try {
     
      const response = await api.get(
        `/invoices/${invoiceData.id}/pdf`,
        { responseType: "blob" }
      );
      // Logic to trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice-${invoiceData.id}.pdf`);
      document.body.appendChild(link);
      link.click();
     
      console.log("Downloading PDF for ID:", invoiceData.id);
    } catch (error) {
      console.error("Failed to download PDF:", error);
    }
  };


  // ==========================================
  // J. Send to Patient Email
  // ==========================================
  const sendEmail = async () => {
    try {
       
      await api.post(`/invoices/${invoiceData.id}/send-email`);
     
      alert("Email sent to patient!");
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };


  // ==========================================
  // K. Billing History
  // ==========================================
  const viewHistory = async () => {
    try {
     
      const response = await api.get(`/invoices/history/${selectedConsultation.dbId}`);
      console.log(response.data);
      // Trigger a separate modal or state to show history
     
      console.log("Fetching history for consultation:", selectedConsultation?.dbId);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-sans">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-xl flex flex-col max-h-[90vh]">
       
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-indigo-50/30 rounded-t-lg">
          <div className="flex items-center space-x-2">
            <span className="text-blue-600 text-2xl font-bold">$</span>
            <h2 className="text-2xl font-semibold text-gray-800">Post-Consultation Billing</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>


        {/* D. Replace Hardcoded Values */}
        <div className="grid grid-cols-2 gap-4 p-6 bg-indigo-50/30 border-b text-sm">
          <div>
            <p className="text-gray-500 mb-1">Patient Name</p>
            <p className="font-semibold">{invoiceData.patientName}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Ticket ID</p>
            <p className="font-semibold">{invoiceData.ticketNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Consultation Type</p>
            <p className="font-semibold">{invoiceData.consultationType || "Video"}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-1">Assigned Doctor</p>
            <p className="font-semibold">{invoiceData.doctorName}</p>
          </div>
        </div>


        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
         
          {/* Consultation Summary */}
          <div className="border rounded-xl p-6 bg-gray-50/50">
            <div className="flex items-center space-x-2 mb-6">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">Consultation Summary</h3>
            </div>
           
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Base Consultation Fee</p>
                <p className="text-blue-600 text-xl font-semibold">₱{consultationFee.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Consultation Date</p>
                <p className="font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Duration</p>
                <p className="font-medium text-gray-800">{invoiceData.duration || "30 mins"}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Payment Type</p>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  className="w-full border rounded-md p-2 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="Private">Private</option>
                  <option value="HMO">HMO</option>
                  <option value="PhilHealth">PhilHealth</option>
                  <option value="Yakap">YAKAP</option>
                </select>
              </div>
            </div>
          </div>


          {/* Additional Billable Services */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Billable Services</h3>
            <div className="space-y-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center justify-between border rounded-lg p-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={service.checked}
                      onChange={() => handleServiceToggle(service.id)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="font-medium text-gray-700">{service.label}</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">₱</span>
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => handlePriceChange(service.id, e.target.value)}
                      className="w-24 border rounded-md p-1.5 text-right bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              ))}
            </div>


            {/* F. Add Custom Service Inputs */}
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-700 mb-2">Add Custom Service</p>
              <div className="flex space-x-3">
                <input
                  type="text"
                  placeholder="Service name..."
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                  className="flex-1 border rounded-lg p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className="w-32 border rounded-lg p-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={addCustomService}
                  className="bg-gray-500 hover:bg-gray-600 text-white rounded-lg px-4 flex items-center justify-center transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>


          {/* Final Billing Summary */}
          <div className="border border-blue-100 bg-blue-50/50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Final Billing Summary</h3>
           
            <div className="space-y-3 text-sm text-gray-600 border-b border-blue-100 pb-4 mb-4">
              <div className="flex justify-between">
                <span>Base Consultation Fee</span>
                <span className="font-medium text-gray-800">₱{consultationFee.toFixed(2)}</span>
              </div>
             
              {/* List dynamically checked services */}
              {services.filter(s => s.checked).map(s => (
                <div key={s.id} className="flex justify-between pl-4">
                  <span>{s.label}</span>
                  <span>₱{s.price.toFixed(2)}</span>
                </div>
              ))}
              {customServices.map(s => (
                <div key={s.id} className="flex justify-between pl-4">
                  <span>{s.label}</span>
                  <span>₱{s.price.toFixed(2)}</span>
                </div>
              ))}
            </div>


            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700">Subtotal</span>
              <span className="font-semibold text-gray-800">₱{subtotal.toFixed(2)}</span>
            </div>
           
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold text-blue-600">Final Total</span>
              <span className="text-xl font-bold text-blue-600">₱{finalTotal.toFixed(2)}</span>
            </div>


            <div className="flex items-center justify-between pt-4 border-t border-blue-100">
              <span className="font-semibold text-gray-800">Payment Status</span>
              <div className="flex space-x-2 bg-white rounded-lg p-1 border">
                {['Pending', 'Partial', 'Paid'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setPaymentStatus(status)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                      paymentStatus === status
                        ? status === 'Pending' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-800'
                        : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Footer Buttons Triggering Functions */}
        <div className="p-6 border-t bg-gray-50 rounded-b-lg space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <button onClick={onClose} className="py-2.5 border rounded-lg bg-white hover:bg-gray-50 font-medium text-gray-700">
              Cancel
            </button>
            <button onClick={downloadPDF} className="py-2.5 border rounded-lg bg-white hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Download PDF</span>
            </button>
            <button onClick={sendEmail} className="py-2.5 border rounded-lg bg-white hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Send to Patient</span>
            </button>
            <button onClick={viewHistory} className="py-2.5 border rounded-lg bg-white hover:bg-gray-50 font-medium text-gray-700 flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>View History</span>
            </button>
          </div>
          {/* Main Save / Gateway Action */}
          <button onClick={saveInvoice} className="w-full py-3 bg-[#00a843] hover:bg-[#00923a] text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span>Save & Redirect to Payment Gateway</span>
          </button>
        </div>


      </div>
    </div>
  );
};


export default InvoiceModal;
