```js id="rjkrj4"
// /components/common/Sidebar.js

const sidebarItems = [
  {
    label: "Dashboard",
    icon: "grid-outline",
    route: "/screens/nurse/NurseDashboardScreen",
  },

  {
    label: "Patient Queue",
    icon: "people-outline",
    route: "/screens/nurse/PatientQueueScreen",
    badgeKey: "queueCount",
  },

  {
    label: "Callbacks",
    icon: "call-outline",
    route: "/screens/nurse/CallbackScreen",
    badgeKey: "callbackCount",
  },

  {
    label: "Follow-ups",
    icon: "chatbubble-outline",
    route: "/screens/nurse/FollowupScreen",
    badgeKey: "unreadFollowups",
  },

  {
    label: "Billing",
    icon: "cash-outline",
    route: "/screens/nurse/BillingScreen",
    badgeKey: "pendingInvoices",
  },

  {
    label: "Medical Records",
    icon: "folder-open-outline",
    route: "/screens/nurse/MedicalRecordsScreen",
  },

  {
    label: "Triage Workspace",
    icon: "medkit-outline",
    route: "/screens/nurse/TriageWorkspaceScreen",
  },

  },

];
```
