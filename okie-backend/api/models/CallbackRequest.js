module.exports = (sequelize, DataTypes) => {
  const CallbackRequest = sequelize.define("CallbackRequest", {
    ticketNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    preferredMethod: {
      type: DataTypes.ENUM(
        "Phone Call",
        "Viber Call",
        "Viber Video"
      ),
      allowNull: false,
    },

    contactNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    chiefComplaint: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    symptoms: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    nurseRemarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    callbackNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "Waiting",
        "In Progress",
        "Escalated",
        "Inquiry",
        "Closed"
      ),
      defaultValue: "Waiting",
    },

    requestTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  CallbackRequest.associate = (models) => {
    CallbackRequest.belongsTo(models.Patient, {
      foreignKey: "patientId",
    });

    CallbackRequest.belongsTo(models.User, {
      as: "assignedNurse",
      foreignKey: "assignedNurseId",
    });

    CallbackRequest.belongsTo(models.User, {
      as: "assignedDoctor",
      foreignKey: "assignedDoctorId",
    });

    CallbackRequest.belongsTo(models.Consultation, {
      foreignKey: "consultationId",
    });
  };

  return CallbackRequest;
};