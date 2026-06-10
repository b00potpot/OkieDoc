export const mockAppointments = [
  {
    id: "APT-001",

    patientId: "PT-1001",
    patientName: "Maria Santos",

    specialistId: "DOC-001",
    specialistName: "Dr. Angela Cruz",

    specialty: "Cardiology",

    appointmentDate: "2026-06-12",
    appointmentTime: "09:00 AM",

    consultationType: "Video Consultation",

    chiefComplaint:
      "Chest tightness and elevated blood pressure",

    status: "scheduled",

    urgency: "normal",

    createdAt: "2026-06-10T08:20:00",

    notes:
      "Patient referred after abnormal ECG findings.",
  },

  {
    id: "APT-002",

    patientId: "PT-1002",
    patientName: "John Reyes",

    specialistId: "DOC-002",
    specialistName: "Dr. Michael Tan",

    specialty: "Neurology",

    appointmentDate: "2026-06-11",
    appointmentTime: "01:30 PM",

    consultationType: "Callback Consultation",

    chiefComplaint:
      "Recurring dizziness and severe headaches",

    status: "confirmed",

    urgency: "urgent",

    createdAt: "2026-06-10T09:15:00",

    notes:
      "Neurological assessment requested by triage nurse.",
  },

  {
    id: "APT-003",

    patientId: "PT-1003",
    patientName: "Anna Lopez",

    specialistId: "DOC-003",
    specialistName: "Dr. Sarah Lim",

    specialty: "General Medicine",

    appointmentDate: "2026-06-13",
    appointmentTime: "03:00 PM",

    consultationType: "Voice Consultation",

    chiefComplaint:
      "Persistent cough and sore throat",

    status: "pending",

    urgency: "low",

    createdAt: "2026-06-10T10:05:00",

    notes:
      "Awaiting specialist confirmation.",
  },

  {
    id: "APT-004",

    patientId: "PT-1004",
    patientName: "Leo Ramos",

    specialistId: "DOC-004",
    specialistName: "Dr. Patricia Ong",

    specialty: "Orthopedics",

    appointmentDate: "2026-06-14",
    appointmentTime: "11:15 AM",

    consultationType: "Video Consultation",

    chiefComplaint:
      "Lower back pain after lifting injury",

    status: "completed",

    urgency: "normal",

    createdAt: "2026-06-09T14:30:00",

    notes:
      "Pain management and physical therapy recommended.",
  },

  {
    id: "APT-005",

    patientId: "PT-1005",
    patientName: "Sophia Garcia",

    specialistId: "DOC-005",
    specialistName: "Dr. Kevin Yu",

    specialty: "Endocrinology",

    appointmentDate: "2026-06-15",
    appointmentTime: "10:45 AM",

    consultationType: "Chat Consultation",

    chiefComplaint:
      "Uncontrolled blood sugar levels",

    status: "cancelled",

    urgency: "normal",

    createdAt: "2026-06-10T07:50:00",

    notes:
      "Patient requested rescheduling.",
  },
];