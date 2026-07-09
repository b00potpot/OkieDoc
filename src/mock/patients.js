export const mockPatients = [
  {
    id: "PT-1001",
    name: "Maria Santos",
    age: 34,
    gender: "Female",

    phone: "09171234567",

    bloodType: "O+",

    allergies: [
      "Penicillin",
      "Seafood"
    ],

    medicalHistory: [
      "Hypertension",
      "Asthma"
    ],

    chiefComplaint:
      "Persistent headache and dizziness",

    status: "waiting",

    urgency: "normal",

    modeOfCommunication: "video",

    createdAt: "2026-06-10T08:30:00",

    lastVisit: "2026-05-22",

    callbackNumber: null,

    isCallback: false,
  },

  {
    id: "PT-1002",
    name: "John Reyes",
    age: 58,
    gender: "Male",

    phone: "09987654321",

    bloodType: "A-",

    allergies: [],

    medicalHistory: [
      "Diabetes",
      "Heart Disease"
    ],

    chiefComplaint:
      "Chest pain and fatigue",

    status: "pending",

    urgency: "urgent",

    modeOfCommunication: "callback",

    createdAt: "2026-06-10T09:10:00",

    lastVisit: "2026-06-01",

    callbackNumber: 4,

    isCallback: true,
  },
];