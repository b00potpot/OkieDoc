// config/routes.js
module.exports.routes = {

  // ==========================================
  // Patient Routes
  // ==========================================
  'POST /patients':                        'PatientController.register',
  'GET /patients':                         'PatientController.findAll',
  'GET /patients/search':                  'PatientController.search',
  'GET /patients/:id':                     'PatientController.findOne',
  'PATCH /patients/:id':                   'PatientController.update',

  // ==========================================
  // Appointment Routes
  // ==========================================
  'POST /appointments':                    'AppointmentController.create',
  'GET /appointments':                     'AppointmentController.findAll',

  // ==========================================
  // Consultation & Ticket Routes
  // ==========================================
  // Drafts
  'POST /consultations/draft':             'ConsultationTicketController.createDraft',
  'PUT /consultations/draft/:id':          'ConsultationTicketController.updateDraft',
  'GET /consultations/draft/:id':          'ConsultationTicketController.getDraft',
  
  // Ticket lifecycle & Submission
  'POST /consultations':                   'ConsultationTicketController.createTicket',
  'GET /consultations/pending':            'ConsultationController.pending',
  'GET /consultations/:id':                'ConsultationController.status',
  'GET /consultations/doctor/:doctorId':   'ConsultationController.findByDoctor', 

  // Status & Workflow Actions
  'PUT /consultations/:id/start':          'ConsultationController.start',
  'PUT /consultations/:id/approve':        'ConsultationController.approve',
  'PUT /consultations/:id/complete':       'ConsultationController.complete',
  'PUT /consultations/:id/cancel':         'ConsultationController.cancel',
  'PATCH /consultations/:id/close':        'ConsultationController.closeTicket',
  'POST /consultations/:id/invoice':       'ConsultationController.generateInvoice',

  // Nurse & Staff Actions
  'PUT /consultations/:id/remarks':        'NurseController.addRemarks',
  'PUT /consultations/:id/assign-gp':      'NurseController.assignGP',
  'PUT /consultations/:id/assign-nurse':   'ConsultationTicketController.assignNurse',

  // ==========================================
  // SOAP Notes
  // ==========================================
  'POST /soap':                            'SOAPController.create',
  'GET /soap':                             'SOAPController.findAll',
  'GET /soap/:consultationId':             'SOAPController.findByConsultation',

  // ==========================================
  // Prescriptions & Labs
  // ==========================================
  'POST /prescriptions':                   'PrescriptionController.create',
  'POST /prescriptions/:id/items':         'PrescriptionController.addItem',
  'GET /prescriptions/patient/:patientId': 'PrescriptionController.findByPatient',

  'POST /laboratories':                    'LaboratoryController.create',
  'GET /laboratories/patient/:patientId':  'LaboratoryController.findByPatient',

  // ==========================================
  // Follow-Ups (Corrected to match FollowUpsController.js)
  // ==========================================
  'GET /followups':                        'FollowUpsController.find',
  'GET /followups/search':                 'FollowUpsController.search',
  'GET /followups/status/:status':         'FollowUpsController.findByStatus',
  'GET /followups/:id':                    'FollowUpsController.findOne',
  'GET /followups/dashboard/counts':       'FollowUpsController.dashboardCounts',

  // Actions
  'PUT /followups/:id/extend':             'FollowUpsController.extend',
  'PUT /followups/:id/close':              'FollowUpsController.close',
  'PUT /followups/:id/reopen':             'FollowUpsController.reopen',
  'PUT /followups/:id/refer':              'FollowUpsController.refer',
  'POST /followups/:id/schedule':          'FollowUpsController.schedule',

  // ==========================================
  // Follow-Up Messages (Corrected to match FollowUpMessagesController.js)
  // ==========================================
  'GET /followups/:id/messages':           'FollowUpMessagesController.find',
  'POST /followups/:id/messages':          'FollowUpMessagesController.create',
  'PUT /followups/messages/:messageId/read':'FollowUpMessagesController.markRead',
  'GET /followups/unread-count':           'FollowUpMessagesController.unreadCount',
  
  // ==========================================
  // Medical Records
  // ==========================================
  'POST /medical-records':                             'MedicalRecordController.create',
  'GET /medical-records/patient/:patientId':           'MedicalRecordController.findByPatient',
  'GET /medical-records/consultation/:consultationId': 'MedicalRecordController.findByConsultation',

  // ==========================================
  // Doctors, Availability & Dashboard / Billing
  // ==========================================
  'POST /doctors':                         'DoctorController.create',
  'GET /doctors':                          'DoctorController.findAll',
  'GET /doctors/specialization':           'DoctorController.findBySpecialization',
  'GET /doctors/availability':             'DoctorController.availability',
  
  // Backwards compatibility matching for frontend layouts using '/specialists' paths
  'GET /specialists':                      'DoctorController.findBySpecialization',
  'GET /specialists/availability':         'DoctorController.availability',

  // Billing & Analytics Dashboards
  'POST /billing':                         'BillingController.create',
  'GET /dashboard/nurse':                  'ConsultationController.dashboardCounts',

  'GET /billing':                          'BillingController.findAll',
  'GET /billing/search':                   'BillingController.search',
  'POST /billing/:id/mark-paid':           'BillingController.markPaid',
  'POST /billing/:id/resend-link':         'BillingController.resendLink',
  'POST /billing/:id/followup':            'BillingController.followup',
  'POST /billing/:id/escalate':            'BillingController.escalate',
  'GET /billing/export':                   'BillingController.export',

  // ==========================================
  // Invoice Routes
  // ==========================================
  // Core Invoice CRUD
  'POST /invoices':                                'InvoiceController.createInvoice',
  'GET /invoices/consultation/:consultationId':    'InvoiceController.getInvoiceByConsultation',
  'PATCH /invoices/:id':                           'InvoiceController.updateInvoice',
  
  // Invoice Audit / History
  'GET /invoices/:id/history':                     'InvoiceController.getInvoiceHistory',
  
  // Export & Communication
  'GET /invoices/:id/pdf':                         'InvoiceController.generateInvoicePDF',
  'POST /invoices/:id/send-email':                 'InvoiceController.sendInvoiceEmail',
  
  // ==========================================
  // Callback Routes 
  // ==========================================
  'GET /callbacks':                        'CallbackController.getAllCallbacks',
  'GET /callbacks/:id':                    'CallbackController.getCallbackById',
  'PUT /callbacks/:id/notes':              'CallbackController.updateCallback',
  'PUT /callbacks/:id/start':              'CallbackController.startCallback',
  'PUT /callbacks/:id/inquiry':            'CallbackController.markAsInquiry',
  'POST /callbacks/:id/escalate':          'CallbackController.escalateToDoctor',
  'POST /callbacks/:id/convert':           'CallbackController.convertToTicket',
  'PUT /callbacks/:id/complete':           'CallbackController.markAsCompleted'
};